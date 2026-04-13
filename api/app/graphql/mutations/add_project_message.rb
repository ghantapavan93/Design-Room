module Mutations
  class AddProjectMessage < BaseMutation
    argument :design_id, ID, required: true
    argument :body, String, required: true
    argument :design_session_token, String, required: true
    argument :client_txn_id, String, required: true
    argument :actor_name, String, required: true
    argument :participant_id, String, required: true

    field :project_message, Types::ProjectMessageType, null: true
    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(design_id:, body:, design_session_token:, client_txn_id:, actor_name:, participant_id:)
      start_time = Time.current
      design = Design.find(design_id)
      session = validate_session(design, design_session_token)

      unless session
        return { project_message: nil, success: false, errors: ["Invalid or expired session"] }
      end

      # Permission check: at least suggester for project messages
      perm_error = check_permission(session, participant_id, 'suggester')
      return { project_message: nil, success: false, errors: perm_error[:errors], error_code: perm_error[:error_code] } if perm_error

      Design.transaction do
        existing_msg = design.project_messages.find_by(client_txn_id: client_txn_id)
        if existing_msg
          return { project_message: existing_msg, success: true, errors: [] }
        end

        # Resolve actor identity from server
        actor = session.session_members.find_by(participant_id: participant_id)
        
        message = design.project_messages.create!(
          body: body,
          author_name: actor&.display_name || "Unknown",
          author_role: actor&.role || "viewer",
          client_txn_id: client_txn_id
        )

        if message.persisted?
          ActionCable.server.broadcast("design_room_#{design.id}", { 
            type: 'project_message', 
            message: {
              id: message.id.to_s,
              authorName: message.author_name,
              authorRole: message.author_role,
              body: message.body,
              createdAt: message.created_at.iso8601,
              clientTxnId: message.client_txn_id
            }
          })
          
          Rails.logger.info "[GraphQL] Mutation AddProjectMessage success: design_id=#{design_id}, latency=#{(Time.current - start_time) * 1000}ms"
          { project_message: message, success: true, errors: [] }
        else
          { project_message: nil, success: false, errors: message.errors.full_messages }
        end
      end
    end
  end
end
