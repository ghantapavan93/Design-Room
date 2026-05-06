const fs = require('fs');
let content = fs.readFileSync('web/app/design/[id]/page.tsx', 'utf8');

const mutationsToUpdate = [
  'APPLY_MATERIAL_MUTATION', 'SUGGEST_MATERIAL_MUTATION', 'APPROVE_SUGGESTION_MUTATION', 'REJECT_SUGGESTION_MUTATION',
  'SAVE_VERSION_MUTATION', 'RESTORE_VERSION_MUTATION', 'CREATE_LINK_MUTATION', 'ADD_REGION_COMMENT_MUTATION', 'ADD_PROJECT_MESSAGE_MUTATION',
  'TOGGLE_REGION_LOCK_MUTATION', 'RECORD_EXPORT_MUTATION'
];

mutationsToUpdate.forEach(m => {
    const regex = new RegExp(`api\\.graphqlRequest<any>\\(${m}, \\{([\\s\\S]*?)\\}\\)`, 'g');
    content = content.replace(regex, (match, vars) => {
        if (!vars.includes('workspaceId')) {
             return `api.graphqlRequest<any>(${m}, {${vars}, workspaceId: workspaceId || undefined})`;
        }
        return match;
    });
});

fs.writeFileSync('web/app/design/[id]/page.tsx', content);
