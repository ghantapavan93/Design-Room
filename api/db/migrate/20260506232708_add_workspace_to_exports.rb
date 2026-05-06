class AddWorkspaceToExports < ActiveRecord::Migration[7.1]
  def change
    add_reference :design_exports, :design_workspace, foreign_key: true
  end
end
