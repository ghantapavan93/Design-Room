require 'fileutils'
file = 'web/app/design/[id]/page.tsx'
text = File.read(file)

text.gsub!(/input: \{ commentId: comment.id, designSessionToken: sessionToken, resolve: true \}/,
          "input: { commentId: comment.id, designSessionToken: sessionToken, resolve: true, participantId: participantIdRef.current }")

text.gsub!(/input: \{ linkId: id, designSessionToken: sessionToken \}/,
          "input: { linkId: id, designSessionToken: sessionToken, participantId: participantIdRef.current }")

File.write(file, text)
