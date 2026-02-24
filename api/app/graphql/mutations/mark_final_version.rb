module Mutations
  class MarkFinalVersion < BaseMutation
    argument :version_id, ID, required: true
    argument :actor_name, String, required: true
    argument :design_session_token, String, required: false
    argument :client_txn_id, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :design, Types::DesignType, null: true

    def resolve(version_id:, actor_name:, client_txn_id:, design_session_token: nil)
      version = DesignVersion.find(version_id)
      design = version.design

      # Basic idempotency check just by returning success if already final
      if design.final_version_id == version.id
        return { success: true, errors: [], design: design }
      end

      # Mark as final
      design.update!(final_version_id: version.id)

      # Optionally broadcast that the design is approved, but the client will refetch via StartPolling or just update statusChip.
      ActionCable.server.broadcast(
        "design_room_#{design.id}",
        { type: 'status_update', message: { final_version_id: version.id } }
      )

      { success: true, errors: [], design: design }
    end
  end
end
