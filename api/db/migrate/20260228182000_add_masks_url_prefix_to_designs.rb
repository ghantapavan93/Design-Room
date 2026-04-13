class AddMasksUrlPrefixToDesigns < ActiveRecord::Migration[7.1]
  def change
    add_column :designs, :masks_url_prefix, :string
  end
end
