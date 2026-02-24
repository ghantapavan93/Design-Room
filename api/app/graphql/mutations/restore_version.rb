module Mutations
  class RestoreVersion < BaseMutation
    argument :version_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :actor_permission, String, required: false
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: false

    def resolve(version_id:, actor_name:, actor_role: nil, actor_permission: nil, client_txn_id:, design_session_token: nil)
      version = DesignVersion.find(version_id)
      design = version.design
      
      # Idempotency Check
      cached_response = ensure_idempotency(design.id, client_txn_id)
      return cached_response if cached_response

      DesignEvent.transaction do
        state = design.design_state || design.create_design_state(state_json: {})

        session = nil
        if design_session_token
          session = DesignSession.find_by(token: design_session_token, design_id: design.id)
        end

        event = DesignEvent.create!(
          design: design,
          design_session: session,
          event_type: 'restore_version',
          actor_name: actor_name,
          actor_role: actor_role,
          actor_permission: actor_permission,
          client_txn_id: client_txn_id,
          note: "Restored from version: #{version.label}"
        )

        state.update!(
          state_json: version.snapshot_state_json,
          last_event_id: event.id,
          last_saved_at: Time.current
        )

        ActionCable.server.broadcast("design_room_#{design.id}", { event: event, state: state })

        respond_success(event: event, design: design)
      end
    end
  end
end
