require 'fileutils'
file = 'web/app/design/[id]/page.tsx'
text = File.read(file)

text.gsub!(/actorPermission: permission/, "participantId: participantIdRef.current")
text.gsub!(/actorPermission:/, "participantId:")

# For JOIN_SESSION_MUTATION
if text.include?("input: { designId, displayName, role, permission, participantId: participantIdRef.current || undefined }")
  text.gsub!("input: { designId, displayName, role, permission, participantId: participantIdRef.current || undefined }", 
              "input: { designId, displayName, shareToken: shareToken || undefined, participantId: participantIdRef.current || undefined }")
end

if !text.include?("const shareToken = sessionStorage.getItem('shareToken');")
  text.gsub!("let permission = sessionStorage.getItem('sessionPermission') || 'viewer';",
             "let permission = sessionStorage.getItem('sessionPermission') || 'viewer';\n            const shareToken = sessionStorage.getItem('shareToken');")
end

File.write(file, text)
puts 'Updated page.tsx'
