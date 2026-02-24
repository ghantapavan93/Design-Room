module Mutations
  class ApproveSuggestion < BaseMutation
    argument :event_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :actor_permission, String, required: false
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: false

    def resolve(event_id:, actor_name:, actor_role: nil, actor_permission: nil, client_txn_id:, design_session_token: nil)
      target_event = DesignEvent.find(event_id)
      design = target_event.design

      return respond_error('Target event is not a suggestion') unless target_event.event_type == 'suggest_material'

      # Idempotency Check
      cached_response = ensure_idempotency(design.id, client_txn_id)
      return cached_response if cached_response

      DesignEvent.transaction do
        state = design.design_state || design.create_design_state(state_json: {})
        current_state_json = state.state_json

        from_material_id = current_state_json[target_event.region]

        session = nil
        if design_session_token
          session = DesignSession.find_by(token: design_session_token, design_id: design.id)
        end

        event = DesignEvent.create!(
          design: design,
          design_session: session,
          event_type: 'approve_suggestion',
          actor_name: actor_name,
          actor_role: actor_role,
          actor_permission: actor_permission,
          region: target_event.region,
          from_material_id: from_material_id,
          to_material_id: target_event.to_material_id,
          client_txn_id: client_txn_id,
          note: "Approved suggestion #{target_event.id}"
        )

        current_state_json[target_event.region] = target_event.to_material_id
        state.update!(
          state_json: current_state_json, 
          last_event_id: event.id,
          last_saved_at: Time.current
        )

        # Broadcast update
        ActionCable.server.broadcast("design_room_#{design.id}", { event: event, state: state })

        respond_success(event: event, design: design)
      end
    end
  end
end
