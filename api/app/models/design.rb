class Design < ApplicationRecord
  has_many :design_workspaces, dependent: :destroy
  has_one :design_state, dependent: :destroy
  has_many :design_sessions, dependent: :destroy
  has_many :design_events, dependent: :destroy
  has_many :design_versions, dependent: :destroy
  has_many :elements, dependent: :destroy
  has_many :share_links, dependent: :destroy
  has_many :region_locks, dependent: :destroy
  has_many :region_comments, dependent: :destroy
  has_many :project_messages, dependent: :destroy
  has_many :design_exports, dependent: :destroy
  
  # Optional: reference to the active final version
  belongs_to :final_version, class_name: 'DesignVersion', optional: true

  validates :title, presence: true

  def stream_name(workspace_id = nil)
    if workspace_id.present? && workspace_id != "default"
      "design_room_#{id}_#{workspace_id}"
    else
      "design_room_#{id}"
    end
  end
end
