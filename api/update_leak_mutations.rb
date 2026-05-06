['restore_version.rb', 'revert_event.rb'].each do |file|
  path = "app/graphql/mutations/#{file}"
  content = File.read(path)
  content.sub!(/(client_txn_id:[^\n]+)/, "\\1,\n          design_workspace_id: workspace_id")
  File.write(path, content)
end

path = "app/graphql/mutations/mark_final_version.rb"
content = File.read(path)
content.sub!(/design\.update!\(final_version_id: version_id\)/, 'design.design_workspaces.find(workspace_id).update!(final_version_id: version_id)')
File.write(path, content)

path = "app/graphql/mutations/resolve_region_comment.rb"
content = File.read(path)
content.sub!(/comment = design\.region_comments\.find\(comment_id\)/, 'comment = design.region_comments.where(design_workspace_id: workspace_id).find(comment_id)')
File.write(path, content)
