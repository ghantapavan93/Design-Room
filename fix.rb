Dir.glob('api/app/graphql/mutations/*.rb').each do |file|
  text = File.read(file)
  if text.include?('participant_id: participant_id') && !text.include?('def resolve(')
    # wait, replace participant_id: participant_id, where it is passing as kwargs to create!
    text.gsub!(/participant_id:\s*participant_id\s*,/, "actor_permission: session.session_members.find_by(participant_id: participant_id)&.permission,")
    File.write(file, text)
    puts "Fixed \#{file}"
  end
end
