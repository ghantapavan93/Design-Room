module Mutations
  class Heartbeat < BaseMutation
    argument :design_session_token, String, required: true
    argument :display_name, String, required: true
    argument :role, String, required: true
    argument :permission, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :members, GraphQL::Types::JSON, null: true

    def resolve(design_session_token:, display_name:, role:, permission:)
      session = DesignSession.find_by!(token: design_session_token)

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
        "design_room_#{session.design_id}",
        { members: members_payload }
      )

      { success: true, errors: [], members: members_payload }
    rescue => e
      { success: false, errors: [e.message], members: nil }
    end
  end
end
