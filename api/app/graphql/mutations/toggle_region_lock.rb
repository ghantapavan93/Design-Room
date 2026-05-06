module Mutations
  class ToggleRegionLock < BaseMutation
    argument :design_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :region, String, required: true
    argument :design_session_token, String, required: true
    argument :lock_reason, String, required: false
    argument :actor_name, String, required: true
    argument :participant_id, String, required: true

    field :region_lock, Types::RegionLockType, null: true
    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(design_id:, region:, design_session_token:, lock_reason: nil, actor_name:, participant_id:, workspace_id: nil)
      workspace_id ||= context[:workspace_id]
      start_time = Time.current
      design = Design.find(design_id)
      session = validate_session(design, design_session_token)

      unless session
        return { region_lock: nil, success: false, errors: ["Invalid or expired session"] }
      end

      # Permission check: only editors can lock/unlock regions
      perm_error = ensure_editor_permission(session, participant_id)
      return { region_lock: nil, success: false, errors: perm_error[:errors], error_code: perm_error[:error_code] } if perm_error

      # Resolve actor identity from server — never trust client-supplied name for ownership
      member = session.session_members.find_by(participant_id: participant_id)
      locked_by = member&.display_name || "Unknown"

      RegionLock.transaction do
        lock = design.region_locks.find_by(region: region)

        if lock
          lock.destroy
          ActionCable.server.broadcast("design_room_#{design.id}_#{workspace_id}", {
            type: 'region_unlock',
            region: region
          })

          Rails.logger.info "[GraphQL] ToggleRegionLock (unlock): design_id=#{design_id}, region=#{region}, latency=#{(Time.current - start_time) * 1000}ms"
          { region_lock: nil, success: true, errors: [] }
        else
          lock = design.region_locks.create!(
            region: region,
            locked_by: locked_by,
            lock_reason: lock_reason,
            design_workspace_id: workspace_id
          )

          ActionCable.server.broadcast("design_room_#{design.id}_#{workspace_id}", {
            type: 'region_lock',
            region: region,
            lockedBy: locked_by,
            expiresAt: lock.expires_at
          })

          Rails.logger.info "[GraphQL] ToggleRegionLock (lock): design_id=#{design_id}, region=#{region}, latency=#{(Time.current - start_time) * 1000}ms"
          { region_lock: lock, success: true, errors: [] }
        end
      end
    rescue ActiveRecord::RecordNotUnique
      existing = design.region_locks.find_by(region: region)
      if existing
        return { region_lock: existing, success: false, errors: ["Region is already locked by #{existing.locked_by}"] }
      end
      { region_lock: nil, success: false, errors: ["Region is already locked by another user"] }
    end
  end
end
