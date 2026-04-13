module Mutations
  class BaseMutation < Types::BaseMutation
    # Define common result fields
    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :error_code, String, null: true
    field :event, Types::DesignEventType, null: true
    field :design, Types::DesignType, null: true

    def respond_success(event: nil, design: nil)
      { success: true, errors: [], error_code: nil, event: event, design: design }
    end

    def respond_error(message, error_code = 'VALIDATION_ERROR')
      { success: false, errors: [message], error_code: error_code, event: nil, design: nil }
    end

    def validate_session(design, token)
      return nil unless token.present?
      
      DesignSession.find_by(design_id: design.id, token: token)
    end

    def ensure_idempotency(design_id, client_txn_id)
      return nil unless client_txn_id.present?
      
      existing_event = DesignEvent.find_by(design_id: design_id, client_txn_id: client_txn_id)
      if existing_event
        # Idempotent return: just return success with the existing event
        return respond_success(event: existing_event, design: existing_event.design)
      end
      nil
    end

    # Server-side permission enforcement securely tied to the database via participant_id
    def check_permission(session, participant_id, required_permission)
      return { success: false, errors: ["Missing participant context."], error_code: 'UNAUTHORIZED' } unless participant_id.present?

      member = session.session_members.find_by(participant_id: participant_id)
      return { success: false, errors: ["Session member not found."], error_code: 'UNAUTHORIZED' } unless member

      actor_permission = member.permission

      permission_levels = { 'viewer' => 0, 'suggester' => 1, 'editor' => 2 }
      actor_level = permission_levels[actor_permission] || 0
      required_level = permission_levels[required_permission] || 0

      if actor_level < required_level
        return { success: false, errors: ["Insufficient permission. Requires '#{required_permission}' access."], error_code: 'FORBIDDEN' }
      end
      nil
    end

    def ensure_editor_permission(session, participant_id)
      check_permission(session, participant_id, 'editor')
    end
  end
end
