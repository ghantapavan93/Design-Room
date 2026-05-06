const fs = require('fs');
let content = fs.readFileSync('web/app/design/[id]/page.tsx', 'utf8');

// Add workspaceId state
if (!content.includes('const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);')) {
  content = content.replace(/const \[design, setDesign\] = React\.useState<Design \| null>\(null\);/, 
    'const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);\n    const [design, setDesign] = React.useState<Design | null>(null);');
}

// Add CREATE_DESIGN_WORKSPACE_MUTATION to imports
if (!content.includes('CREATE_DESIGN_WORKSPACE_MUTATION')) {
  content = content.replace(/import \{([^}]+)\} from '@\/api\/queries';/, 'import { CREATE_DESIGN_WORKSPACE_MUTATION, $1 } from \'@/api/queries\';');
}

// Add workspace creation effect
const workspaceEffect = `
    // Initialize Workspace
    React.useEffect(() => {
        if (!designId) return;

        const storedWorkspaceId = typeof window !== "undefined" ? sessionStorage.getItem(\`designWorkspaceId_\${designId}\`) : null;
        if (storedWorkspaceId) {
            setWorkspaceId(storedWorkspaceId);
            return;
        }

        const hasShareToken = typeof window !== "undefined" && !!sessionStorage.getItem(\`shareToken_\${designId}\`);
        if (hasShareToken) return; // Will be set during JOIN_SESSION

        async function createWorkspace() {
            try {
                const res = await api.graphqlRequest<any>(CREATE_DESIGN_WORKSPACE_MUTATION, {
                    designId,
                    participantId: participantIdRef.current || 'unknown'
                });
                const id = res?.createDesignWorkspace?.workspace?.id;
                if (id) {
                    sessionStorage.setItem(\`designWorkspaceId_\${designId}\`, id);
                    setWorkspaceId(id);
                }
            } catch (e) {
                console.error("Failed to create workspace", e);
            }
        }
        createWorkspace();
    }, [designId]);
`;
if (!content.includes('// Initialize Workspace')) {
  content = content.replace(/\/\/ Fetch Initial Data/, workspaceEffect + '\n    // Fetch Initial Data');
}

// Update DESIGN_QUERY
content = content.replace(/api\.graphqlRequest<any>\(DESIGN_QUERY, \{ id: designId \}\)/g, 'api.graphqlRequest<any>(DESIGN_QUERY, workspaceId ? { id: designId, workspaceId } : { id: designId })');

// Change the dependency of the fetch Initial Data effect
content = content.replace(/}, \[designId\]\);(\s+)\/\/ Lock Expiry Cleanup Hook/g, '}, [designId, workspaceId]);$1// Lock Expiry Cleanup Hook');

// Add workspaceId to JOIN_SESSION_MUTATION if present
content = content.replace(/if \(payload\.members\) setMembers\(payload\.members\);/, `if (payload.members) setMembers(payload.members);
                if (payload.workspaceId) {
                    sessionStorage.setItem(\`designWorkspaceId_\${designId}\`, payload.workspaceId);
                    setWorkspaceId(payload.workspaceId);
                }`);

content = content.replace(/shareToken: sessionShareToken \|\| undefined, (\s*)participantId: pId \|\| undefined/, 'shareToken: sessionShareToken || undefined, $1participantId: pId || undefined, workspaceId: workspaceId || undefined');

fs.writeFileSync('web/app/design/[id]/page.tsx', content);
