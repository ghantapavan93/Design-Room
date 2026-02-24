module Mutations
  class SuggestMaterial < BaseMutation
    argument :design_id, ID, required: true
    argument :region, String, required: true
    argument :material_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :actor_permission, String, required: false
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: false

    def resolve(design_id:, region:, material_id:, actor_name:, actor_role: nil, actor_permission: nil, client_txn_id:, design_session_token: nil)
      design = Design.find(design_id)
      
      # Idempotency Check
      cached_response = ensure_idempotency(design.id, client_txn_id)
      return cached_response if cached_response

      state = design.design_state || design.create_design_state(state_json: {})
      from_material_id = state.state_json[region]

      session = nil
      if design_session_token
        session = DesignSession.find_by(token: design_session_token, design_id: design.id)
      end

      # Note: does NOT mutate design state
      event = DesignEvent.create!(
        design: design,
        design_session: session,
        event_type: 'suggest_material',
        actor_name: actor_name,
        actor_role: actor_role,
        actor_permission: actor_permission,
        region: region,
        from_material_id: from_material_id,
        to_material_id: material_id,
        client_txn_id: client_txn_id
      )

      # Broadcast suggestion
      ActionCable.server.broadcast("design_room_#{design.id}", { event: event, state: state })

      respond_success(event: event, design: design)
    end
  end
end
