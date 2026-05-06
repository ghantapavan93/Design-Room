module Mutations
  class AddRegionComment < BaseMutation
    argument :design_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :region, String, required: true
    argument :body, String, required: true
    argument :design_session_token, String, required: true
    argument :client_txn_id, String, required: true
    argument :actor_name, String, required: true
    argument :participant_id, String, required: true

    field :region_comment, Types::RegionCommentType, null: true
    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(design_id:, region:, body:, design_session_token:, client_txn_id:, actor_name:, participant_id:, workspace_id: nil)
      workspace_id ||= context[:workspace_id]
      start_time = Time.current
      design = Design.find(design_id)
      session = validate_session(design, design_session_token)

      unless session
        return { region_comment: nil, success: false, errors: ["Invalid or expired session"] }
      end

      Design.transaction do
        # Permission check: anyone in the session (viewer or higher) can comment
        perm_error = check_permission(session, participant_id, 'viewer')
        return { success: false, errors: perm_error[:errors], error_code: perm_error[:error_code] } if perm_error

        existing_comment = design.region_comments.find_by(client_txn_id: client_txn_id)
        if existing_comment
          return { region_comment: existing_comment, success: true, errors: [] }
        end

        # Identity resolution via verified participant_id from the DB record
        actor = session.session_members.find_by(participant_id: participant_id)
        unless actor
          return { region_comment: nil, success: false, errors: ["Session member not found for participant."] }
        end
        
        comment = design.region_comments.create!(
        region: region,
          body: body,
          author_name: actor.display_name,
          author_role: actor.role,
          client_txn_id: client_txn_id,
        design_workspace_id: workspace_id
      )

        if comment.persisted?
          ActionCable.server.broadcast("design_room_#{design.id}_#{workspace_id}", { 
            type: 'region_comment', 
            comment: {
              id: comment.id.to_s,
              region: comment.region,
              authorName: comment.author_name,
              authorRole: comment.author_role,
              body: comment.body,
              createdAt: comment.created_at.iso8601,
              clientTxnId: comment.client_txn_id
            }
          })

          Rails.logger.info "[GraphQL] Mutation AddRegionComment success: design_id=#{design_id}, region=#{region}, latency=#{(Time.current - start_time) * 1000}ms"
          { region_comment: comment, success: true, errors: [] }
        else
          { region_comment: nil, success: false, errors: comment.errors.full_messages }
        end
      end
    end
  end
end
