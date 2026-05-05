class ChangeMaterialIdsToStringInDesignEvents < ActiveRecord::Migration[7.1]
  def up
    # Clean up legacy corrupted rows before migrating type
    DesignEvent.where(to_material_id: 0).delete_all
    DesignEvent.where(from_material_id: 0).delete_all

    change_column :design_events, :from_material_id, :string
    change_column :design_events, :to_material_id, :string
  end

  def down
    change_column :design_events, :from_material_id, :integer
    change_column :design_events, :to_material_id, :integer
  end
end
