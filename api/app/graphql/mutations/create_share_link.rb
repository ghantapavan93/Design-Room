module Mutations
  class CreateShareLink < BaseMutation
    argument :design_id, ID, required: true
    argument :mode, String, required: true
    argument :permission, String, required: false

    def resolve(design_id:, mode:, permission: nil)
      design = Design.find(design_id)
      
      link = ShareLink.create!(
        design: design,
        mode: mode,
        permission: permission
      )

      { success: true, errors: [], link: link }
    end
  end
end
