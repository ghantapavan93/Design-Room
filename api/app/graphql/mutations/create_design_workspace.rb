module Mutations
  class CreateDesignWorkspace < BaseMutation
    argument :design_id, ID, required: true
    argument :participant_id, String, required: true

    field :success, Boolean, null: false
    field :design, Types::DesignType, null: true
    field :materials, [Types::MaterialPresetType], null: true
    field :workspace, Types::DesignWorkspaceType, null: true
    field :errors, [String], null: false

    def resolve(design_id:, participant_id:)
      design = Design.find(design_id)
      workspace = DesignWorkspace.create_from_design!(
        design: design,
        participant_id: participant_id
      )

      context[:workspace_id] = workspace.id

      {
        success: true,
        workspace: workspace,
        design: design,
        materials: MaterialPreset.all,
        errors: []
      }
    rescue ActiveRecord::RecordInvalid => e
      {
        success: false,
        workspace: nil,
        design: nil,
        materials: nil,
        errors: e.record.errors.full_messages
      }
    rescue => e
      {
        success: false,
        workspace: nil,
        design: nil,
        materials: nil,
        errors: [e.message]
      }
    end
  end
end
