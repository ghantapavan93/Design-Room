require 'fileutils'
file = 'web/app/design/[id]/page.tsx'
text = File.read(file)

text.gsub!("const valid = prev.filter(lock => new Date(lock.expiresAt).getTime() > now);", 
          "const valid = prev.filter((lock: any) => lock.expiresAt ? new Date(lock.expiresAt).getTime() > now : true);")

File.write(file, text)
