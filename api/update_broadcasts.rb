Dir.glob('app/graphql/mutations/*.rb').each do |path|
  content = File.read(path)
  if content.include?('"design_room_#{design.id}"')
    content.gsub!('"design_room_#{design.id}"', '"design_room_#{design.id}_#{workspace_id}"')
    File.write(path, content)
  end
end
