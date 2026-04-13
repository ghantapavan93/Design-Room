class Element < ApplicationRecord
  belongs_to :design

  validates :label, presence: true
  validates :kind, presence: true
  validates :group_key, presence: true
  validates :mask_url, presence: true
end
