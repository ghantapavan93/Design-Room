class ShareLink < ApplicationRecord
  belongs_to :design

  has_secure_token :token, length: 32

  validates :mode, presence: true, inclusion: { in: %w[live view] }
  validates :permission, inclusion: { in: %w[editor suggester viewer] }, allow_nil: true

  scope :active, -> {
    where(revoked_at: nil)
      .where("expires_at IS NULL OR expires_at > ?", Time.current)
  }

  def active?
    revoked_at.nil? && (expires_at.nil? || expires_at > Time.current)
  end

  def revoked?
    revoked_at.present?
  end

  def expired?
    expires_at.present? && expires_at <= Time.current
  end
end

