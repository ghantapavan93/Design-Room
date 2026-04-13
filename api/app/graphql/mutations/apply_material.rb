module Mutations
  class ApplyMaterial < BaseMutation
    argument :design_id, ID, required: true
    argument :region, String, required: true
    argument :material_id, ID, required: true
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :client_txn_id, String, required: true
    argument :design_session_token, String, required: true
    argument :base_version, String, required: false # For optimistic concurrency control
    
    CONFLICT_WINDOW_MS = 2000

    def resolve(design_id:, region:, material_id:, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:, base_version: nil)
      start_time = Time.current
      design = Design.find(design_id)

      session = validate_session(design, design_session_token)
      unless session
        return { success: false, errors: ["Invalid or expired design session."], error_code: 'UNAUTHORIZED' }
      end

      # Enforce editor permission — suggesters must use SuggestMaterial instead
      perm_error = ensure_editor_permission(session, participant_id)
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
          Rails.logger.info "[GraphQL] ApplyMaterial idempotent hit: design_id=#{design_id}, region=#{region}, client_txn_id=#{client_txn_id}"
          return { success: true, errors: [], error_code: nil, event: existing_event }
        end

        lock = design.region_locks.find_by(region: region)
        if lock
          if lock.expires_at && lock.expires_at <= Time.current
             lock.destroy!
             lock = nil
          else
            locked_by = lock.locked_by || "Unknown"
            return {
              success: false, 
              errors: ["Region is locked by #{locked_by}"], 
              error_code: 'LOCKED'
            }
          end
        end

        current_state_json = (state.state_json || {}).dup
        from_material_id = current_state_json[region]

        # Verify base_version to guard against concurrent stomp
        if base_version.present?
            if state.last_event_id.present? && state.last_event_id.to_s != base_version.to_s
               # Another client committed something. We reject this change so the client can pull latest.
               return { success: false, errors: ["Your state is out of date. Please refresh or keep yours."], error_code: 'STALE_VERSION' }
            end
        end

        event = design.design_events.create!(
          design_session: session,
          event_type: "apply_material",
          actor_name: actor_name,
          actor_role: actor_role,
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

        ActionCable.server.broadcast(
          "design_room_#{design.id}",
          {
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
          }
        )

        Rails.logger.info "[GraphQL] ApplyMaterial success: design_id=#{design_id}, region=#{region}, latency_ms=#{((Time.current - start_time) * 1000).round(1)}"
        { success: true, errors: [], error_code: nil, event: event }
      end
    rescue => e
      Rails.logger.error "[GraphQL] ApplyMaterial error: #{e.message}"
      { success: false, errors: [e.message], error_code: 'INTERNAL_ERROR' }
    end
  end
end
