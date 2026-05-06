module Mutations
  class MarkFinalVersion < BaseMutation
    argument :version_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :actor_name, String, required: true
    argument :actor_role, String, required: false
    argument :participant_id, String, required: true
    argument :design_session_token, String, required: true
    argument :client_txn_id, String, required: true

    def resolve(version_id:, actor_name:, actor_role: nil, participant_id:, client_txn_id:, design_session_token:, workspace_id: nil)
      workspace_id ||= context[:workspace_id]
      version = DesignVersion.find(version_id)
      design = version.design

      session = validate_session(design, design_session_token)
      return respond_error('Invalid or expired design session.', 'UNAUTHORIZED') unless session

      perm_error = ensure_editor_permission(session, participant_id)
      return perm_error if perm_error

      # Idempotency check: if already final, just return success
      if design.final_version_id == version.id
        return { success: true, errors: [], design: design }
      end

      # Mark as final
      design.update!(final_version_id: version.id)

      ActionCable.server.broadcast(
        "design_room_#{design.id}_#{workspace_id}",
        { type: 'status_update', message: { final_version_id: version.id } }
      )

      { success: true, errors: [], design: design }
    rescue => e
      Rails.logger.error "[GraphQL] MarkFinalVersion error: #{e.message}"
      { success: false, errors: [e.message] }
    end
  end
end
