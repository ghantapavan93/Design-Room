class MaterialPreset < ApplicationRecord
  validates :category, presence: true
  validates :name, presence: true
  validates :brand, presence: true
  validates :swatch_hex, presence: true
  
  # category should conceptually be one of the regions
end
