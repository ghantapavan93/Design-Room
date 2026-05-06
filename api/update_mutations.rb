Dir.glob('app/graphql/mutations/*.rb').each do |path|
  content = File.read(path)
  changed = false
  
  if content.gsub!(/(\.create!\([^)]*)(\))/) do |m|
       m.include?('design_workspace_id') ? m : "#{$1}, design_workspace_id: workspace_id#{$2}"
     end
    changed = true
  end
  
  if content.gsub!(/(\.new\([^)]*)(\))/) do |m|
       m.include?('design_workspace_id') ? m : "#{$1}, design_workspace_id: workspace_id#{$2}"
     end
    changed = true
  end
  
  File.write(path, content) if changed
end
