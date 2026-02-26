class AddMetadataToMaterialPresets < ActiveRecord::Migration[7.1]
  def change
    add_column :material_presets, :color_family, :string
    add_column :material_presets, :cost_band, :string
    add_column :material_presets, :sku, :string
    add_column :material_presets, :unit_type, :string
  end
end
