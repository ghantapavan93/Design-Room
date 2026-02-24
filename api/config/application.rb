require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_cable/engine"
# require "active_storage/engine"
# require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
# require "action_view/railtie"
# require "sprockets/railtie"
require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

module DesignRoomApi
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.eager_load_paths << Rails.root.join("app", "graphql")
  end
end
