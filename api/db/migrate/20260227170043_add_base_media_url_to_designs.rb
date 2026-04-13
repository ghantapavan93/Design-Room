class AddBaseMediaUrlToDesigns < ActiveRecord::Migration[7.1]
  def change
    add_column :designs, :base_media_url, :string
  end
end
