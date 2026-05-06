module Mutations
  class RejectSuggestion < BaseMutation
    argument :event_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: true

    def resolve(event_id:, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:, workspace_id: nil)
      workspace_id ||= context[:workspace_id]
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
        existing_event = design.design_events.find_by(client_txn_id: client_txn_id)
        if existing_event
          return { success: true, errors: [], event: existing_event }
        end

        event = design.design_events.create!(
        design_session: session,
        event_type: 'reject_suggestion',
        actor_name: actor_name,
        actor_role: actor_role,
        region: target_event.region,
        client_txn_id: client_txn_id,
        note: "Rejected suggestion ##{target_event.id}",
        design_workspace_id: workspace_id
      )

      ActionCable.server.broadcast("design_room_#{design.id}_#{workspace_id}", { 
        type: "design_event",
        event: {
          id: event.id,
          eventType: event.event_type,
          region: event.region,
          actorName: event.actor_name,
          createdAt: event.created_at
        }, 
        state: design.design_state.state_json 
      })

        Rails.logger.info "[GraphQL] Mutation RejectSuggestion success: design_id=#{design.id}, region=#{target_event.region}, latency=#{(Time.current - start_time) * 1000}ms"
        { success: true, errors: [], event: event }
      end
    rescue => e
      Rails.logger.error "[GraphQL] Mutation RejectSuggestion error: #{e.message}"
      { success: false, errors: [e.message] }
    end
  end
end
