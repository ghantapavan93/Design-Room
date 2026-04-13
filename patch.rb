require 'fileutils'
Dir.glob('api/app/graphql/mutations/*.rb').each do |file|
  text = File.read(file)
  if text.include?('argument :actor_permission')
    text.gsub!(/argument :actor_permission, String, required: false/, %(argument :participant_id, String, required: true))
    text.gsub!(/actor_permission:/, %(participant_id:))
    text.gsub!(/actor_permission([^a-zA-Z_])/, %(participant_id\\1))
    
    # We replaced the argument. Need to fix the event creation where we store actor_permission.
    # event.create!(actor_permission: participant_id) is what we get, but the DB expects a string permission.
    # So we change participant_id back to member.permission for the event creation.
    # Actually, we can fetch member = session.session_members.find_by(participant_id: participant_id) in BaseMutation
    # and just store the string. A simple hack is session.session_members.find_by(participant_id: participant_id)&.permission
    
    text.gsub!(/participant_id: participant_id,(\s+)actor_role:/, %(actor_permission: session.session_members.find_by(participant_id: participant_id)&.permission,\\1actor_role:))
    File.write(file, text)
    puts "Modified \#{file}"
  end
end
