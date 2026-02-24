class DesignVersion < ApplicationRecord
  belongs_to :design

  validates :label, presence: true
  validates :snapshot_state_json, presence: true
  validates :created_by, presence: true
end
