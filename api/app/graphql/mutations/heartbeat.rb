module Mutations
  class Heartbeat < BaseMutation
    argument :design_session_token, String, required: true
    argument :participant_id, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :members, GraphQL::Types::JSON, null: true

    def resolve(design_session_token:, participant_id:)
      RegionLock.cleanup_expired!

      session = DesignSession.find_by(token: design_session_token)
      return { success: false, errors: ["Invalid session."], members: nil } unless session

      member = session.session_members.find_by(participant_id: participant_id)
      return { success: false, errors: ["Session member not found."], members: nil } unless member

      # Only update last_seen_at — never accept role/permission from client
      member.update!(last_seen_at: Time.current)

      members_payload = session.session_members
        .where('last_seen_at > ?', 60.seconds.ago)
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
