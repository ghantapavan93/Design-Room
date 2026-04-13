require 'fileutils'
file = 'web/api/queries.ts'
text = File.read(file)

text.gsub!(/\\\\\\$/, "\\\")
text.gsub!(/actorPermission: String/, %(participantId: String!))
text.gsub!(/actorPermission: \\\/, %(participantId: \\\))
text.gsub!(/permission: String!/, %(shareToken: String))
text.gsub!(/permission: \\\/, %(shareToken: \\\))

File.write(file, text)
puts 'Updated queries.ts'
