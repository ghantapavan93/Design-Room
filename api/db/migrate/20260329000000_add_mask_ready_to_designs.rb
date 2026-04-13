class AddMaskReadyToDesigns < ActiveRecord::Migration[7.1]
  def change
    add_column :designs, :mask_ready, :boolean, default: false, null: false
  end
end
