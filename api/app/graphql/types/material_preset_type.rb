module Types
  class MaterialPresetType < Types::BaseObject
    field :id, ID, null: false
    field :category, String, null: false
    field :name, String, null: false
    field :brand, String, null: false
    field :swatch_hex, String, null: false
    field :thumbnail_url, String
    field :color_family, String
    field :cost_band, String
    field :sku, String
    field :unit_type, String
  end
end
