module Mutations
  class RecordExport < BaseMutation
    argument :design_id, ID, required: true
    argument :design_session_token, String, required: true
    argument :export_type, String, required: true
    argument :version_label, String, required: false
    argument :design_version_id, ID, required: false
    argument :estimate_total, Float, required: false
    argument :actor_name, String, required: true
    argument :participant_id, String, required: true

    field :design_export, Types::DesignExportType, null: true

    def resolve(design_id:, design_session_token:, export_type:, actor_name:, version_label: nil, design_version_id: nil, estimate_total: nil, participant_id:)
      design = Design.find(design_id)
      session = validate_session(design, design_session_token)
      return respond_error("Invalid or expired session.", "UNAUTHORIZED") unless session

      # Permission check: any session member can record an export
      perm_error = check_permission(session, participant_id, 'viewer')
      return { success: false, errors: perm_error[:errors], error_code: perm_error[:error_code] } if perm_error

      # Resolve exporter identity from DB via participant_id
      member = session.session_members.find_by(participant_id: participant_id)
      unless member
        return respond_error("Session member not found for participant.", "UNAUTHORIZED")
      end

      exported_by = member.display_name

      # Use finalVersionId if no explicit version given
      resolved_version_id = design_version_id || design.final_version_id

      export = DesignExport.create!(
        design: design,
        design_version_id: resolved_version_id,
        exported_by: exported_by,
        export_type: export_type,
        version_label: version_label,
        estimate_total: estimate_total
      )

      { success: true, errors: [], design_export: export }
    rescue => e
      Rails.logger.error "[GraphQL] RecordExport error: #{e.message}"
      { success: false, errors: [e.message], design_export: nil }
    end
  end
end
