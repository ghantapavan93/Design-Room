class DesignEvent < ApplicationRecord
  include DesignRegions

  belongs_to :design
  belongs_to :design_session, optional: true

  EVENT_TYPES = %w[
    apply_material suggest_material approve_suggestion 
    reject_suggestion save_version restore_version revert_event
  ].freeze

  validates :event_type, presence: true, inclusion: { in: EVENT_TYPES }
  validates :actor_name, presence: true
  
  # Validation handled by unique index on DB: [design_id, client_txn_id]
end
