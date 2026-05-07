module Mutations
  class JoinDesignSession < BaseMutation
    argument :design_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :display_name, String, required: true
    argument :participant_id, String, required: true
    argument :share_token, String, required: false

    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :design_session_token, String, null: true
    field :members, GraphQL::Types::JSON, null: true
    field :effective_permission, String, null: true

    def resolve(design_id:, display_name:, participant_id:, share_token: nil, workspace_id: nil)
      design = Design.find(design_id)

      # Reuse existing session for this design instead of creating a new one every time
      session = DesignSession.find_or_create_by!(design: design)

      # Standard re-entry check: Does this participant already exist in the session?
      member = session.session_members.find_by(participant_id: participant_id)

      if share_token.present?
        # Validate entry via share link
        link = ShareLink.find_by(token: share_token, design_id: design_id)
        if link.nil?
          puts "JOIN REJECTED: Invalid share link"
          return { success: false, errors: ["Invalid share link."], design_session_token: nil }
        elsif !link.active?
          puts "JOIN REJECTED: Link expired or revoked"
          return { success: false, errors: ["This share link is expired or revoked."], design_session_token: nil }
        end

        effective_permission = link.permission || (link.mode == 'live' ? 'suggester' : 'viewer')
        effective_role = effective_permission == 'editor' ? 'contractor' : 'homeowner'
        link.update_column(:last_accessed_at, Time.current)
      elsif member
        puts "JOIN RE-ENTRY: found existing member #{member.id}"
        # Re-entry: allow the established member to join with their saved permission
        effective_permission = member.permission
        effective_role = member.role
      else
        puts "JOIN NEW VISITOR: no share token"
        # In demo mode, anyone accessing the base URL without a token is assumed to be the Contractor/Editor.
        # Homeowners MUST use a share link.
        effective_permission = 'editor'
        effective_role = 'contractor'
      end

      # Update or initialize member
      member ||= session.session_members.new(participant_id: participant_id)

      # Force identity correctly: If they are following a link, they adopt its role
      # regardless of what they were before in this session's database (prevents tab-bleeding).
      member.display_name = display_name

      # Defensive de-duplication: Ensure display_name complies with the unique DB index
      # without throwing ActiveRecord::RecordNotUnique which crashes the WebSocket.
      original_name = member.display_name
      counter = 1
      while session.session_members.where.not(id: member.id).exists?(display_name: member.display_name)
        member.display_name = "#{original_name} (#{counter})"
        counter += 1
      end

      member.role = effective_role
      member.permission = effective_permission
      member.last_seen_at = Time.current
      member.save!

      Rails.logger.info "[SessionJoin] User #{participant_id} joined Design #{design_id} as #{effective_role} (#{effective_permission})"


      members_payload = session.session_members
        .order(last_seen_at: :desc)
        .limit(12)
        .map do |m|
          {
            id: m.id.to_s,
            displayName: m.display_name,
            role: m.role,
            permission: m.permission,
            lastSeenAt: m.last_seen_at&.iso8601
          }
        end

      ActionCable.server.broadcast("design_room_#{design.id}_#{workspace_id}",
        { members: members_payload }
      )

      {
        success: true,
        errors: [],
        design_session_token: session.token,
        members: members_payload,
        effective_permission: member.permission
      }
    rescue => e
      { success: false, errors: [e.message], design_session_token: nil, members: nil }
    end
  end
end
