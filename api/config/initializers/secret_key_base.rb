require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.secret_key_base = "dev_secret_key_base_for_local_development_only_do_not_use_in_production_123456"
end
