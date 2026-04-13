links = ShareLink.where(revoked_at: nil).where("expires_at > ?", Time.current)
links.each do |l|
  puts "#{l.permission&.upcase}: http://localhost:3001/design/live/#{l.token}"
end
