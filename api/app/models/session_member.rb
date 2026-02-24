class SessionMember < ApplicationRecord
  belongs_to :design_session

  validates :display_name, presence: true
  validates :role, presence: true, inclusion: { in: %w[contractor homeowner] }
  validates :permission, presence: true, inclusion: { in: %w[editor suggester viewer] }
  
  # For unique presence
  validates :display_name, uniqueness: { scope: :design_session_id }
end
