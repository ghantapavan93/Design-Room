class DesignWorkspace < ApplicationRecord
  belongs_to :design

  has_many :design_events, dependent: :destroy
  has_many :design_versions, dependent: :destroy
  has_many :share_links, dependent: :destroy
  has_many :region_comments, dependent: :destroy
  has_many :project_messages, dependent: :destroy
  has_many :region_locks, dependent: :destroy
  has_many :session_members, dependent: :destroy

  scope :active, -> { where("expires_at IS NULL OR expires_at > ?", Time.current) }

  def self.create_from_design!(design:, participant_id:, label: nil)
    create!(
      design: design,
      state_json: design.state&.state_json || {},
      last_event_id: design.state&.last_event_id,
      final_version_id: design.final_version_id,
      created_by_participant_id: participant_id,
      label: label,
      expires_at: 24.hours.from_now
    )
  end
end
