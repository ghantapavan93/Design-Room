module Mutations
  class SuggestMaterial < BaseMutation
    argument :design_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :region, String, required: true
    argument :material_id, ID, required: false
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: true

    def resolve(design_id:, region:, material_id: nil, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:, workspace_id: nil)
      workspace_id ||= context[:workspace_id]
      start_time = Time.current
      region = region.to_s.downcase.strip
      design = Design.find(design_id)
      
      session = validate_session(design, design_session_token)
      unless session
        return { success: false, errors: ["Invalid or expired design session."] }
      end

      perm_error = check_permission(session, participant_id, 'suggester')
      return perm_error if perm_error

      Design.transaction do
        state = design.design_state || design.create_design_state!

        # Validate region: must be a known bulk group or a valid element ID for this design
        valid_bulk_groups = ["walls", "roof", "trim", "windows", "door", "garage"]
        unless valid_bulk_groups.include?(region) || design.elements.exists?(id: region)
          return { success: false, errors: ["Invalid region or element ID: #{region}"], error_code: 'INVALID_REGION' }
        end

        existing_event = design.design_events.find_by(client_txn_id: client_txn_id)
        if existing_event
          return { success: true, errors: [], event: existing_event }
        end

        from_material_id = state.state_json[region]

      event = design.design_events.create!(
        design_session: session,
        event_type: 'suggest_material',
        actor_name: actor_name,
        actor_role: actor_role,
        region: region,
        from_material_id: from_material_id,
        to_material_id: material_id,
        client_txn_id: client_txn_id,
        design_workspace_id: workspace_id
      )

      # Broadcast suggestion
      ActionCable.server.broadcast(design.stream_name(workspace_id), { 
        type: "design_event",
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

        Rails.logger.info "[GraphQL] Mutation SuggestMaterial success: design_id=#{design_id}, region=#{region}, latency=#{(Time.current - start_time) * 1000}ms"
        { success: true, errors: [], event: event }
      end
    rescue => e
      Rails.logger.error "[GraphQL] Mutation SuggestMaterial error: #{e.message}"
      { success: false, errors: [e.message] }
    end
  end
end
