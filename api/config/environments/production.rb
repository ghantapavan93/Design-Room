require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.cache_store = :null_store
  config.active_support.deprecation = :notify
  config.active_support.disallowed_deprecation = :log
  config.active_support.disallowed_deprecation_warnings = []
  config.log_level = :info
  config.log_tags = [:request_id]

  config.action_cable.mount_path = "/cable"
  config.action_cable.allowed_request_origins = ENV.fetch("ALLOWED_ORIGINS", "").split(",").map(&:strip)
end
