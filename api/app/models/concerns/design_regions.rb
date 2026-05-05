# frozen_string_literal: true

module DesignRegions
  extend ActiveSupport::Concern

  DESIGN_REGIONS = %w[walls roof trim windows].freeze

  included do
    validates :region, presence: true, allow_nil: true
  end
end
