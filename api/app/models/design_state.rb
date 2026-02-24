class DesignState < ApplicationRecord
  belongs_to :design

  validates :state_json, presence: true
end
