module Mutations
  class CreateShareLink < BaseMutation
    argument :design_id, ID, required: true
    argument :mode, String, required: true
    argument :permission, String, required: false
    argument :design_session_token, String, required: true
    argument :participant_id, String, required: true

    field :link, Types::ShareLinkType, null: true

    def resolve(design_id:, mode:, permission: nil, design_session_token:, participant_id:)
      design = Design.find(design_id)

      session = validate_session(design, design_session_token)
      unless session
        return { success: false, errors: ["Invalid or expired design session."], error_code: 'UNAUTHORIZED', link: nil }
      end

      perm_error = ensure_editor_permission(session, participant_id)
      return { success: false, errors: perm_error[:errors], error_code: perm_error[:error_code], link: nil } if perm_error

      link = ShareLink.create!(
        design: design,
        mode: mode,
        permission: permission,
        expires_at: 7.days.from_now
      )

      { success: true, errors: [], link: link }
    rescue => e
      Rails.logger.error "[GraphQL] CreateShareLink error: #{e.message}"
      { success: false, errors: [e.message], link: nil }
    end
  end
end
