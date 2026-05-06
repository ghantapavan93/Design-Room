const fs = require('fs');
let content = fs.readFileSync('web/api/queries.ts', 'utf8');

if (!content.includes('CREATE_DESIGN_WORKSPACE_MUTATION')) {
  content += `\nexport const CREATE_DESIGN_WORKSPACE_MUTATION = \`
  mutation CreateDesignWorkspace($designId: ID!, $participantId: String!) {
    createDesignWorkspace(input: { designId: $designId, participantId: $participantId }) {
      success
      workspace { id stateJson expiresAt }
      errors
    }
  }
\`;\n`;
}

content = content.replace(/query Design\(\$id: ID!, \$eventsAfterId: Int\) \{/, 'query Design($id: ID!, $workspaceId: ID, $eventsAfterId: Int) {');
content = content.replace(/design\(id: \$id, eventsAfterId: \$eventsAfterId\) \{/, 'design(id: $id, workspaceId: $workspaceId, eventsAfterId: $eventsAfterId) {');

const mutations = ['ApplyMaterial', 'SuggestMaterial', 'ApproveSuggestion', 'RejectSuggestion', 'SaveVersion', 'CreateShareLink', 'AddRegionComment', 'AddProjectMessage', 'ToggleRegionLock', 'RecordExport'];
mutations.forEach(m => {
  const regexDef = new RegExp(`mutation ${m}\\((.*?)\\$designId: ID!(.*?)\\) \\{`);
  content = content.replace(regexDef, `mutation ${m}($1$designId: ID!, $workspaceId: ID$2) {`);
  const regexCall = new RegExp(`${m.charAt(0).toLowerCase() + m.slice(1)}\\(input: \\{ designId: \\$designId(.*?)\\}`, 'g');
  content = content.replace(regexCall, `${m.charAt(0).toLowerCase() + m.slice(1)}(input: { designId: $designId, workspaceId: $workspaceId$1}`);
});

fs.writeFileSync('web/api/queries.ts', content);
