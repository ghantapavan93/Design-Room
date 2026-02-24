class ShareLink < ApplicationRecord
  belongs_to :design

  has_secure_token :token, length: 32

  validates :mode, presence: true, inclusion: { in: %w[live view] }
  validates :permission, inclusion: { in: %w[editor suggester viewer] }, allow_nil: true
end
