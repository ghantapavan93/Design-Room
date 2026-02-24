module Mutations
  class SaveVersion < BaseMutation
    argument :design_id, ID, required: true
    argument :label, String, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :actor_permission, String, required: false
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: false

    def resolve(design_id:, label:, actor_name:, actor_role: nil, actor_permission: nil, client_txn_id:, design_session_token: nil)
      design = Design.find(design_id)
      
      # Idempotency Check
      cached_response = ensure_idempotency(design.id, client_txn_id)
      return cached_response if cached_response

      DesignEvent.transaction do
        state = design.design_state || design.create_design_state(state_json: {})

        session = nil
        if design_session_token
          session = DesignSession.find_by(token: design_session_token, design_id: design.id)
        end

        version = DesignVersion.create!(
          design: design,
          label: label,
          snapshot_state_json: state.state_json,
          created_by: actor_name
        )

        event = DesignEvent.create!(
          design: design,
          design_session: session,
          event_type: 'save_version',
          actor_name: actor_name,
          actor_role: actor_role,
          actor_permission: actor_permission,
          client_txn_id: client_txn_id,
          note: "Saved version: #{label}"
        )

        state.update!(last_saved_at: Time.current)

        ActionCable.server.broadcast("design_room_#{design.id}", { event: event, state: state, version: version })

        respond_success(event: event, design: design)
      end
    end
  end
end
