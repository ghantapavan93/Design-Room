module Mutations
  class RevertEvent < BaseMutation
    argument :event_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: true

    def resolve(event_id:, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:)
      start_time = Time.current
      target_event = DesignEvent.find(event_id)
      design = target_event.design
      
      session = validate_session(design, design_session_token)
      unless session
        return { success: false, errors: ["Invalid or expired design session."] }
      end

      perm_error = ensure_editor_permission(session, participant_id)
      return perm_error if perm_error

      Design.transaction do
        state = design.design_state || design.create_design_state!

        # Guard: only revert events that actually changed a material (have region + from_material_id)
        unless target_event.region.present? && target_event.from_material_id.present?
          return { success: false, errors: ["Cannot revert this event type (#{target_event.event_type}). Only material changes can be reverted."], error_code: 'INVALID_REVERT' }
        end

        existing_event = design.design_events.find_by(client_txn_id: client_txn_id)
        if existing_event
          return { success: true, errors: [], event: existing_event }
        end

        current_state_json = state.state_json.dup

        event = design.design_events.create!(
          design_session: session,
          event_type: 'revert_event',
          actor_name: actor_name,
          actor_role: actor_role,
          region: target_event.region,
          from_material_id: current_state_json[target_event.region],
          to_material_id: target_event.from_material_id,
          client_txn_id: client_txn_id,
          note: "Reverted event ##{target_event.id}"
        )

        current_state_json[target_event.region] = target_event.from_material_id
        state.update!(
          state_json: current_state_json,
          last_event_id: event.id,
          last_saved_at: Time.current
        )

        ActionCable.server.broadcast("design_room_#{design.id}", { 
          event: {
            id: event.id,
            eventType: event.event_type,
            region: event.region,
            fromMaterialId: event.from_material_id,
            toMaterialId: event.to_material_id,
            actorName: event.actor_name,
            createdAt: event.created_at
          }, 
          state: state.state_json 
        })

        Rails.logger.info "[GraphQL] Mutation RevertEvent success: design_id=#{design.id}, region=#{target_event.region}, latency=#{(Time.current - start_time) * 1000}ms"
        { success: true, errors: [], event: event }
      end
    rescue => e
      Rails.logger.error "[GraphQL] Mutation RevertEvent error: #{e.message}"
      { success: false, errors: [e.message] }
    end
  end
end
