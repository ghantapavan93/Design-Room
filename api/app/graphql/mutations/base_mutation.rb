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

    def ensure_idempotency(design_id, client_txn_id)
      return nil unless client_txn_id.present?
      
      existing_event = DesignEvent.find_by(design_id: design_id, client_txn_id: client_txn_id)
      if existing_event
        # Idempotent return: just return success with the existing event
        return respond_success(event: existing_event, design: existing_event.design)
      end
      nil
    end
  end
end
