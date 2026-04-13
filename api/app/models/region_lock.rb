class RegionLock < ApplicationRecord
  belongs_to :design

  validates :region, presence: true
  validates :locked_by, presence: true

  def self.cleanup_expired!
    where('expires_at < ?', Time.current).destroy_all
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end
end
