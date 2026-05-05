class RunProductionSeeds < ActiveRecord::Migration[7.1]
  def up
    puts "Running seeds from migration for Render Free Tier..."
    begin
      if Design.count == 0
        Rails.application.load_seed
      else
        puts "Database already seeded. Skipping."
      end
    rescue => e
      puts "Seed failed (ignoring to allow deploy): #{e.message}"
    end
  end

  def down
    # Do nothing
  end
end
