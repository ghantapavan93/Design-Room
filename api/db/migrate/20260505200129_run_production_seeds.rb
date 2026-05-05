class RunProductionSeeds < ActiveRecord::Migration[7.1]
  def up
    puts "Running seeds from migration for Render Free Tier..."
    Rails.application.load_seed
  end

  def down
    # Do nothing
  end
end
