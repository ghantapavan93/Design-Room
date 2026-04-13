require 'fileutils'
file = 'web/app/design/[id]/page.tsx'
text = File.read(file)

unless text.include?('Lock Expiry Cleanup Hook')
  hook = %Q{
    // Lock Expiry Cleanup Hook
    React.useEffect(() => {
        const interval = setInterval(() => {
            setLockedRegions(prev => {
                const now = Date.now();
                const valid = prev.filter(lock => new Date(lock.expiresAt).getTime() > now);
                if (valid.length !== prev.length) return valid;
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);
  }
  text.gsub!("const isJoiningRef = React.useRef(false);", "\#{hook}\n\n    const isJoiningRef = React.useRef(false);")
end

unless text.include?('DebugOverlay')
  overlay = %Q{
const DebugOverlay = ({ sessionToken, permission, pid, socketActive }: any) => (
    <div className="fixed bottom-4 left-4 p-3 bg-black/80 text-green-400 text-[10px] font-mono rounded z-50 pointer-events-none shadow-lg">
        <div>ID: {pid?.substring(0,6)}...</div>
        <div>LVL: {permission.toUpperCase()}</div>
        <div>SOCK: {socketActive ? 'CONNECTED' : 'WAITING'}</div>
    </div>
);
  }
  text.gsub!("export default function DesignEditorPage", "\#{overlay}\n\nexport default function DesignEditorPage")
  
  # Now inject the component in the return output before </EditorShell>
  text.gsub!("</EditorShell>", "    <DebugOverlay sessionToken={sessionToken} permission={permission} pid={participantIdRef.current} socketActive={socketActive} />\n        </EditorShell>")
end

File.write(file, text)
puts 'Updated page.tsx with UX fixes'
