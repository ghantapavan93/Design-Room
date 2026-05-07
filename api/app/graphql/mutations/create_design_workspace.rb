module Mutations
  class CreateDesignWorkspace < BaseMutation
    argument :design_id, ID, required: true
    argument :workspace_id, ID, required: false
    argument :participant_id, String, required: true

    field :success, Boolean, null: false
    field :design, Types::DesignType, null: true
    field :materials, [Types::MaterialPresetType], null: true
    field :workspace, Types::DesignWorkspaceType, null: true
    field :errors, [String], null: false

    def resolve(design_id:, participant_id:, workspace_id: nil)
      design = Design.find(design_id)
      workspace = DesignWorkspace.create_from_design!(
        design: design,
        participant_id: participant_id
      )

      {
        success: true,
        workspace: workspace,
        errors: []
      }
    rescue ActiveRecord::RecordInvalid => e
      {
        success: false,
        workspace: nil,
        errors: e.record.errors.full_messages
      }
    rescue => e
      {
        success: false,
        workspace: nil,
        errors: [e.message]
      }
    end
  end
end
