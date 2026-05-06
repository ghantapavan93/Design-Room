module Mutations
  class ResolveRegionComment < BaseMutation
    argument :comment_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :design_session_token, String, required: true
    argument :resolve, Boolean, required: true  # true = resolve, false = reopen
    argument :participant_id, String, required: true

    field :region_comment, Types::RegionCommentType, null: true

    def resolve(comment_id:, design_session_token:, resolve:, participant_id:, workspace_id: nil)
      workspace_id ||= context[:workspace_id]
      comment = RegionComment.find_by(id: comment_id)
      return respond_error("Comment not found", "NOT_FOUND") unless comment

      design = comment.design
      session = validate_session(design, design_session_token)
      return respond_error("Invalid or expired session.", "UNAUTHORIZED") unless session

      member = session.session_members.find_by(participant_id: participant_id)
      return respond_error("No session member found.", "UNAUTHORIZED") unless member

      is_editor = member.permission == 'editor'
      is_author = member.display_name == comment.author_name
      unless is_editor || is_author
        return respond_error("Only editors or the comment author can resolve/reopen.", "FORBIDDEN")
      end

      if resolve
        comment.update!(resolved_at: Time.current)
      else
        comment.update!(resolved_at: nil)
      end

      ActionCable.server.broadcast(
        "design_room_\#{design.id}",
        { type: 'region_comment_resolved', comment: {
          id: comment.id,
          region: comment.region,
          resolved_at: comment.resolved_at&.iso8601
        }}
      )

      { success: true, errors: [], region_comment: comment }
    rescue => e
      Rails.logger.error "[GraphQL] ResolveRegionComment error: \#{e.message}"
      { success: false, errors: [e.message], region_comment: nil }
    end
  end
end
