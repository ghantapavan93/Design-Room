require_relative 'api/config/environment'
ShareLink.all.each do |l|
  puts "DESIGN #{l.design_id} - #{l.mode.upcase}: /design/live/#{l.token}" if l.mode == 'live'
  puts "DESIGN #{l.design_id} - #{l.mode.upcase}: /design/view/#{l.token}" if l.mode == 'view'
end
