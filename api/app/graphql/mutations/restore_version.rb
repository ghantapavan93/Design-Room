module Mutations
  class RestoreVersion < BaseMutation
    argument :version_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: true

    def resolve(version_id:, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:)
      start_time = Time.current
      version = DesignVersion.find(version_id)
      design = version.design
      
      session = validate_session(design, design_session_token)
      unless session
        return { success: false, errors: ["Invalid or expired design session."] }
      end

      perm_error = ensure_editor_permission(session, participant_id)
      return perm_error if perm_error

      Design.transaction do
        state = design.design_state || design.create_design_state!

        existing_event = design.design_events.find_by(client_txn_id: client_txn_id)
        if existing_event
          return { success: true, errors: [], event: existing_event }
        end

        event = design.design_events.create!(
          design_session: session,
          event_type: 'restore_version',
          actor_name: actor_name,
          actor_role: actor_role,
          client_txn_id: client_txn_id,
          note: "Restored from version: #{version.label}"
        )

        state.update!(
          state_json: version.snapshot_state_json,
          last_event_id: event.id,
          last_saved_at: Time.current
        )

        ActionCable.server.broadcast("design_room_#{design.id}", { 
          event: {
            id: event.id,
            eventType: event.event_type,
            actorName: event.actor_name,
            createdAt: event.created_at
          }, 
          state: state.state_json 
        })

        Rails.logger.info "[GraphQL] Mutation RestoreVersion success: design_id=#{design.id}, version_id=#{version_id}, latency=#{(Time.current - start_time) * 1000}ms"
        { success: true, errors: [], event: event }
      end
    rescue => e
      Rails.logger.error "[GraphQL] Mutation RestoreVersion error: #{e.message}"
      { success: false, errors: [e.message] }
    end
  end
end
