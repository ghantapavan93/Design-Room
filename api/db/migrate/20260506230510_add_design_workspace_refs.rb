class AddDesignWorkspaceRefs < ActiveRecord::Migration[7.1]
  def change
    add_reference :design_events, :design_workspace, foreign_key: true
    add_reference :design_versions, :design_workspace, foreign_key: true
    add_reference :share_links, :design_workspace, foreign_key: true
    add_reference :region_comments, :design_workspace, foreign_key: true
    add_reference :project_messages, :design_workspace, foreign_key: true
    add_reference :region_locks, :design_workspace, foreign_key: true
    add_reference :session_members, :design_workspace, foreign_key: true
  end
end
