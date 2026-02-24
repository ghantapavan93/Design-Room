module Mutations
  class ApplyMaterial < BaseMutation
    argument :design_id, ID, required: true
    argument :region, String, required: true
    argument :material_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :actor_permission, String, required: false
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: false

    CONFLICT_WINDOW_MS = 2000

    def resolve(design_id:, region:, material_id:, actor_name:, actor_role: nil, actor_permission: nil, client_txn_id:, design_session_token: nil)
      design = Design.find(design_id)
      
      # Idempotency Check
      cached_response = ensure_idempotency(design.id, client_txn_id)
      return cached_response if cached_response

      DesignEvent.transaction do
        last_event = DesignEvent
                      .where(design_id: design.id, region: region, event_type: 'apply_material')
                      .order(created_at: :desc)
                      .first

        # Conflict Rules
        if last_event && (Time.current - last_event.created_at) * 1000 <= CONFLICT_WINDOW_MS
          if last_event.actor_name != actor_name
            raise ActiveRecord::Rollback
            return respond_error('Region was edited recently by another user. Review and retry.', 'CONFLICT')
          end
        end

        state = design.design_state || design.create_design_state(state_json: {})
        current_state_json = state.state_json

        from_material_id = current_state_json[region]

        session = nil
        if design_session_token
          session = DesignSession.find_by(token: design_session_token, design_id: design.id)
        end

        event = DesignEvent.create!(
          design: design,
          design_session: session,
          event_type: 'apply_material',
          actor_name: actor_name,
          actor_role: actor_role,
          actor_permission: actor_permission,
          region: region,
          from_material_id: from_material_id,
          to_material_id: material_id,
          client_txn_id: client_txn_id
        )

        current_state_json[region] = material_id
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
