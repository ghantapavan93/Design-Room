class Design < ApplicationRecord
  has_one :design_state, dependent: :destroy
  has_many :design_sessions, dependent: :destroy
  has_many :design_events, dependent: :destroy
  has_many :design_versions, dependent: :destroy
  has_many :share_links, dependent: :destroy
  
  # Optional: reference to the active final version
  belongs_to :final_version, class_name: 'DesignVersion', optional: true

  validates :title, presence: true
end
