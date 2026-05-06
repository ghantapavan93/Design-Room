collab_mutations = [
  'add_project_message.rb', 'add_region_comment.rb', 'apply_material.rb', 'approve_suggestion.rb',
  'mark_final_version.rb', 'record_export.rb', 'reject_suggestion.rb', 'resolve_region_comment.rb',
  'restore_version.rb', 'revert_event.rb', 'save_version.rb', 'suggest_material.rb',
  'toggle_region_lock.rb', 'unlock_design.rb'
]

collab_mutations.each do |filename|
  path = File.join('app/graphql/mutations', filename)
  next unless File.exist?(path)
  
  content = File.read(path)
  
  # 1. Ensure workspace_id argument exists
  unless content.include?('argument :workspace_id')
    content.sub!(/(argument :design_id[^\n]+\n)/, "\\1    argument :workspace_id, ID, required: false\n")
    # Some mutations use :version_id or :event_id instead of :design_id as the first arg
    content.sub!(/(argument :(version|event|comment)_id[^\n]+\n)/, "\\1    argument :workspace_id, ID, required: false\n")
  end

  # 2. Fix resolve method signature (remove the trailing comma and the broken line)
  # Look for "def resolve(...,\n          design_workspace_id: workspace_id"
  content.gsub!(/def resolve\((.*?)\),\s*\n\s+design_workspace_id: workspace_id/, 'def resolve(\\1, workspace_id: nil)')
  
  # Also handle cases where it might already be correct but missing workspace_id: nil
  unless content.include?('workspace_id: nil')
    content.sub!(/def resolve\((.*?)\)/, 'def resolve(\\1, workspace_id: nil)')
  end

  # 3. Ensure workspace_id is normalized inside resolve
  # We'll insert workspace_id ||= context[:workspace_id] at the start of resolve
  unless content.include?('workspace_id ||= context[:workspace_id]')
    content.sub!(/(def resolve\(.*?\)\n)/, "\\1      workspace_id ||= context[:workspace_id]\n")
  end

  # 4. Update create!/new calls to include design_workspace_id
  # We look for common creation patterns
  content.gsub!(/(create!|new)\(\s*\n([^\)]+)\n\s*\)/m) do |m|
    inner = $2
    if inner.include?('design_workspace_id:')
      m
    else
      # Insert design_workspace_id: workspace_id before the last argument or just at the end
      if inner.include?(',')
        inner.sub!(/([a-z0-9_]+: [^,\n]+)$/, "\\1,\n          design_workspace_id: workspace_id")
      else
        inner + ",\n          design_workspace_id: workspace_id"
      end
      "#{ $1 }(\n#{ inner }\n        )"
    end
  end

  # 5. Update ActionCable broadcasts
  content.gsub!(/"design_room_#\{design\.id\}(?!_#\{workspace_id\})"/, '"design_room_#{design.id}_#{workspace_id}"')
  # Handle cases where it uses target_event.design.id or similar
  content.gsub!(/"design_room_#\{([a-z0-9_\.]+)\.id\}(?!_#\{workspace_id\})"/, '"design_room_#{\\1.id}_#{workspace_id}"')

  File.write(path, content)
end
