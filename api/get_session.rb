design = Design.first
session = DesignSession.find_by(design: design)
if session
  contractor = session.session_members.find_by(role: 'contractor')
  if contractor
    puts "CONTRACTOR_PID=#{contractor.participant_id}"
    puts "SESSION_TOKEN=#{session.token}"
  else
    puts "NO_CONTRACTOR_FOUND"
  end
else
  puts "NO_SESSION_FOUND"
end
