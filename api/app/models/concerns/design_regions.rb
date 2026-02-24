# frozen_string_literal: true

module DesignRegions
  extend ActiveSupport::Concern

  DESIGN_REGIONS = %w[walls roof trim windows].freeze

  included do
    validates :region, inclusion: { in: DESIGN_REGIONS, message: "%{value} is not a valid region" }, allow_nil: true
  end
end
