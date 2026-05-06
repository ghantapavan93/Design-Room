class CreateDesignWorkspaces < ActiveRecord::Migration[7.1]
  def change
    create_table :design_workspaces do |t|
      t.references :design, null: false, foreign_key: true
      t.jsonb :state_json, null: false, default: {}
      t.string :last_event_id
      t.bigint :final_version_id
      t.string :created_by_participant_id
      t.string :label
      t.datetime :expires_at
      t.timestamps
    end

    add_index :design_workspaces, :expires_at
    add_index :design_workspaces, [:design_id, :created_at]
  end
end
