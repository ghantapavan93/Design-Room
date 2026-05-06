module Mutations
  class SaveVersion < BaseMutation
    argument :design_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :label, String, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: true

    def resolve(design_id:, label:, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:, workspace_id: nil),
          design_workspace_id: workspace_id
      start_time = Time.current
      design = Design.find(design_id)
      
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

        version = design.design_versions.create!(
          label: label,
          snapshot_state_json: state.state_json,
          created_by: actor_name
        )

        event = design.design_events.create!(
          design_session: session,
          event_type: 'save_version',
          actor_name: actor_name,
          actor_role: actor_role,
          client_txn_id: client_txn_id,
          note: "Saved version: #{label}"
        )

        state.update!(last_saved_at: Time.current)

        ActionCable.server.broadcast("design_room_#{design.id}", { 
          type: "design_event",
          event: {
            id: event.id,
            eventType: event.event_type,
            actorName: event.actor_name,
            createdAt: event.created_at
          }, 
          state: state.state_json, 
          version: {
            id: version.id,
            label: version.label,
            snapshotStateJson: version.snapshot_state_json,
            createdBy: version.created_by,
            createdAt: version.created_at
          }
        })

        Rails.logger.info "[GraphQL] Mutation SaveVersion success: design_id=#{design_id}, label=#{label}, latency=#{(Time.current - start_time) * 1000}ms"
        { success: true, errors: [], event: event }
      end
    rescue => e
      Rails.logger.error "[GraphQL] Mutation SaveVersion error: #{e.message}"
      { success: false, errors: [e.message] }
    end
  end
end
