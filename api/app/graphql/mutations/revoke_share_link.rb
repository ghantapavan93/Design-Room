module Mutations
  class RevokeShareLink < BaseMutation
    argument :link_id, ID, required: true
    argument :design_session_token, String, required: true
    argument :participant_id, String, required: true

    field :link, Types::ShareLinkType, null: true

    def resolve(link_id:, design_session_token:, participant_id:)
      link = ShareLink.find_by(id: link_id)
      return respond_error("Share link not found.", "NOT_FOUND") unless link

      design = link.design
      session = validate_session(design, design_session_token)
      return respond_error("Invalid or expired session.", "UNAUTHORIZED") unless session

      perm_error = ensure_editor_permission(session, participant_id)
      return perm_error if perm_error

      if link.revoked_at.present?
        return respond_error("Link is already revoked.", "ALREADY_REVOKED")
      end

      link.update!(revoked_at: Time.current)

      { success: true, errors: [], link: link }
    rescue => e
      Rails.logger.error "[GraphQL] RevokeShareLink error: \#{e.message}"
      { success: false, errors: [e.message], link: nil }
    end
  end
end
