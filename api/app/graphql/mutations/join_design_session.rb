module Mutations
  class JoinDesignSession < BaseMutation
    argument :design_id, ID, required: true
    argument :display_name, String, required: true
    argument :role, String, required: true
    argument :permission, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :design_session_token, String, null: true
    field :members, GraphQL::Types::JSON, null: true

    def resolve(design_id:, display_name:, role:, permission:)
      design = Design.find(design_id)

      session = DesignSession.create!(
        design: design,
        token: SecureRandom.hex(24)
      )

      member = SessionMember.find_or_initialize_by(
        design_session_id: session.id,
        display_name: display_name
      )
      member.role = role
      member.permission = permission
      member.last_seen_at = Time.current
      member.save!

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

      ActionCable.server.broadcast(
        "design_room_#{design.id}",
        { members: members_payload }
      )

      {
        success: true,
        errors: [],
        design_session_token: session.token,
        members: members_payload
      }
    rescue => e
      { success: false, errors: [e.message], design_session_token: nil, members: nil }
    end
  end
end
