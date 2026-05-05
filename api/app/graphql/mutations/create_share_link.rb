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

      perm_error = check_permission(session, participant_id, 'editor')
      if perm_error
        # Explicitly return the specific forbidden/unauthorized error from BaseMutation
        return { 
          success: false, 
          errors: ["Only the contractor (Editor) can generate inviting share links. Your current role is restricted."], 
          error_code: 'FORBIDDEN', 
          link: nil 
        }
      end

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
