module Mutations
  class UnlockDesign < BaseMutation
    argument :design_id, ID, required: true
    argument :actor_name, String, required: true
    argument :client_txn_id, String, required: false
    argument :participant_id, String, required: false
    argument :design_session_token, String, required: false

    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(design_id:, actor_name:, client_txn_id: nil, participant_id: nil, design_session_token: nil)
      design = Design.find(design_id)
      
      if design.update(final_version_id: nil)
        # Broadcast status update
        DesignRoomChannel.broadcast_to(
          design,
          {
            type: "status_update",
            message: {
              final_version_id: nil,
              client_txn_id: client_txn_id
            }
          }
        )
        { success: true, errors: [] }
      else
        { success: false, errors: design.errors.full_messages }
      end
    end
  end
end
