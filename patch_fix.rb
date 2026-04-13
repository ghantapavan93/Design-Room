require 'fileutils'
file = 'web/app/design/[id]/page.tsx'
text = File.read(file)

overlay = %Q{
const DebugOverlay = ({ sessionToken, permission, pid, socketActive }: any) => (
    <div className="fixed bottom-4 left-4 p-3 bg-black/80 text-green-400 text-[10px] font-mono rounded z-50 pointer-events-none shadow-lg">
        <div>ID: {pid?.substring(0,6)}...</div>
        <div>LVL: {permission.toUpperCase()}</div>
        <div>SOCK: {socketActive ? 'CONNECTED' : 'WAITING'}</div>
    </div>
);
}

text.gsub!("\#{overlay}", overlay)

# wait, I also injected hook as \#{hook}. Let me fix that if it exists.
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

text.gsub!("\#{hook}\n\n    const isJoiningRef", hook + "\n\n    const isJoiningRef")

# socketActive in page.tsx: the heartbeat logic sets the socket state? There isn't a socketActive state variable actually. ActionCable connects via useCable.
# Let's add a socketActive state:
unless text.include?('setSocketActive')
  text.gsub!("const [design, setDesign] = React.useState<Design | null>(null);", 
             "const [design, setDesign] = React.useState<Design | null>(null);\n    const [socketActive, setSocketActive] = React.useState(false);")
  
  # For action cable connection hook:
  # In page.tsx: "connected: () => { console.log"
  text.gsub!("connected: () => {", "connected: () => { setSocketActive(true);")
  text.gsub!("disconnected: () => {", "disconnected: () => { setSocketActive(false);")
end

File.write(file, text)
