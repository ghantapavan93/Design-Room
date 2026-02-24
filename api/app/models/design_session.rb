class DesignSession < ApplicationRecord
  belongs_to :design
  has_many :session_members, dependent: :destroy
  has_many :design_events, dependent: :nullify

  has_secure_token :token, length: 36
end
