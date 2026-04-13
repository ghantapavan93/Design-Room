export const DESIGNS_QUERY = `
  query Designs {
    designs {
      id
      title
      baseMediaUrl
      maskReady
      createdAt
    }
  }
`;

export const DESIGN_QUERY = `
  query Design($id: ID!, $eventsAfterId: Int) {
    design(id: $id, eventsAfterId: $eventsAfterId) {
      id
      title
      baseMediaUrl
      masksUrlPrefix
      elements { id label kind groupKey maskUrl sortOrder }
      finalVersionId
      maskReady
      state {
        id
        stateJson
        lastEventId
        lastSavedAt
      }
      versions {
        id
        designId
        label
        snapshotStateJson
        createdBy
        createdAt
      }
      recentEvents(limit: 100) {
        id
        actorName
        eventType
        region
        fromMaterialId
        toMaterialId
        note
        clientTxnId
        createdAt
      }
      projectMessages { id authorName authorRole body createdAt }
      regionLocks { id region lockedBy lockReason expiresAt createdAt }
      regionComments { id region authorName authorRole body createdAt resolvedAt }
      shareLinks { id token mode permission revokedAt lastAccessedAt createdAt }
    }
  }
`;

export const MATERIALS_QUERY = `
  query Materials {
    materials {
      id
      category
      name
      brand
      colorFamily
      costBand
      sku
      unitType
      swatchHex
      thumbnailUrl
    }
  }
`;

export const LINK_QUERY = `
  query ShareLink($token: String!) {
    shareLink(token: $token) {
      id
      mode
      permission
      designSessionToken
      design {
        id
      }
    }
  }
`;

export const CREATE_DESIGN_MUTATION = `
  mutation CreateDesign($title: String!, $baseMediaUrl: String, $creatorName: String!, $participantId: String!) {
    createDesign(input: { title: $title, baseMediaUrl: $baseMediaUrl, creatorName: $creatorName, participantId: $participantId }) {
      success
      errors
      design {
        id
        title
      }
      designSessionToken
    }
  }
`;

export const APPLY_MATERIAL_MUTATION = `
  mutation ApplyMaterial($designId: ID!, $region: String!, $materialId: ID!, $actorName: String!, $actorRole: String, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!, $baseVersion: String) {
    applyMaterial(input: { designId: $designId, region: $region, materialId: $materialId, actorName: $actorName, actorRole: $actorRole, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken, baseVersion: $baseVersion }) {
      success
      errors
      errorCode
      event { id eventType region toMaterialId fromMaterialId createdAt actorName }
    }
  }
`;

export const SUGGEST_MATERIAL_MUTATION = `
  mutation SuggestMaterial($designId: ID!, $region: String!, $materialId: ID!, $actorName: String!, $actorRole: String, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    suggestMaterial(input: { designId: $designId, region: $region, materialId: $materialId, actorName: $actorName, actorRole: $actorRole, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
      errorCode
      event { id eventType region toMaterialId fromMaterialId createdAt actorName }
    }
  }
`;

export const APPROVE_SUGGESTION_MUTATION = `
  mutation ApproveSuggestion($eventId: ID!, $actorName: String!, $actorRole: String, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    approveSuggestion(input: { eventId: $eventId, actorName: $actorName, actorRole: $actorRole, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
      errorCode
      event { id eventType region toMaterialId fromMaterialId createdAt actorName }
    }
  }
`;

export const REJECT_SUGGESTION_MUTATION = `
  mutation RejectSuggestion($eventId: ID!, $actorName: String!, $actorRole: String, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    rejectSuggestion(input: { eventId: $eventId, actorName: $actorName, actorRole: $actorRole, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
      errorCode
      event { id eventType region createdAt actorName }
    }
  }
`;

export const SAVE_VERSION_MUTATION = `
  mutation SaveVersion($designId: ID!, $label: String!, $actorName: String!, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    saveVersion(input: { designId: $designId, label: $label, actorName: $actorName, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
      event { id eventType createdAt actorName }
    }
  }
`;

export const RESTORE_VERSION_MUTATION = `
  mutation RestoreVersion($versionId: ID!, $actorName: String!, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    restoreVersion(input: { versionId: $versionId, actorName: $actorName, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
      event { id eventType createdAt actorName }
    }
  }
`;

export const CREATE_LINK_MUTATION = `
  mutation CreateShareLink($designId: ID!, $mode: String!, $permission: String, $designSessionToken: String!, $participantId: String!) {
    createShareLink(input: { designId: $designId, mode: $mode, permission: $permission, designSessionToken: $designSessionToken, participantId: $participantId }) {
      success
      errors
      link { token mode permission }
    }
  }
`;

export const REVERT_EVENT_MUTATION = `
  mutation RevertEvent($eventId: ID!, $actorName: String!, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    revertEvent(input: { eventId: $eventId, actorName: $actorName, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
      event { id eventType region createdAt actorName }
    }
  }
`;

export const MARK_FINAL_MUTATION = `
  mutation MarkFinalVersion($versionId: ID!, $actorName: String!, $participantId: String!, $clientTxnId: String!, $designSessionToken: String!) {
    markFinalVersion(input: { versionId: $versionId, actorName: $actorName, participantId: $participantId, clientTxnId: $clientTxnId, designSessionToken: $designSessionToken }) {
      success
      errors
    }
  }
`;

export const JOIN_SESSION_MUTATION = `
  mutation JoinDesignSession($designId: ID!, $displayName: String!, $participantId: String!, $shareToken: String) {
    joinDesignSession(input: { designId: $designId, displayName: $displayName, participantId: $participantId, shareToken: $shareToken }) {
      success
      errors
      designSessionToken
      members
      effectivePermission
    }
  }
`;

export const HEARTBEAT_MUTATION = `
  mutation Heartbeat($designSessionToken: String!, $participantId: String!) {
    heartbeat(input: { designSessionToken: $designSessionToken, participantId: $participantId }) {
      success
      errors
      members
    }
  }
`;

export const ADD_REGION_COMMENT_MUTATION = `
  mutation AddRegionComment($designId: ID!, $region: String!, $body: String!, $designSessionToken: String!, $clientTxnId: String!, $actorName: String!, $participantId: String!) {
    addRegionComment(input: { designId: $designId, region: $region, body: $body, designSessionToken: $designSessionToken, clientTxnId: $clientTxnId, actorName: $actorName, participantId: $participantId }) {
      success
      errors
      regionComment {
        id
        region
        authorName
        body
        createdAt
      }
    }
  }
`;

export const TOGGLE_REGION_LOCK_MUTATION = `
  mutation ToggleRegionLock($designId: ID!, $region: String!, $designSessionToken: String!, $lockReason: String, $actorName: String!, $participantId: String!) {
    toggleRegionLock(input: { designId: $designId, region: $region, designSessionToken: $designSessionToken, lockReason: $lockReason, actorName: $actorName, participantId: $participantId }) {
      success
      errors
      regionLock { id region lockedBy lockReason expiresAt createdAt }
    }
  }
`;

export const ADD_PROJECT_MESSAGE_MUTATION = `
  mutation AddProjectMessage($designId: ID!, $body: String!, $designSessionToken: String!, $clientTxnId: String!, $actorName: String!, $participantId: String!) {
    addProjectMessage(input: { designId: $designId, body: $body, designSessionToken: $designSessionToken, clientTxnId: $clientTxnId, actorName: $actorName, participantId: $participantId }) {
      success
      errors
      projectMessage { id authorName authorRole body createdAt }
    }
  }
`;

export const RESOLVE_REGION_COMMENT_MUTATION = `
  mutation ResolveRegionComment($commentId: ID!, $designSessionToken: String!, $resolve: Boolean!, $participantId: String!) {
    resolveRegionComment(input: { commentId: $commentId, designSessionToken: $designSessionToken, resolve: $resolve, participantId: $participantId }) {
      success
      errors
      regionComment { id region authorName authorRole body createdAt resolvedAt }
    }
  }
`;

export const REVOKE_SHARE_LINK_MUTATION = `
  mutation RevokeShareLink($linkId: ID!, $designSessionToken: String!, $participantId: String!) {
    revokeShareLink(input: { linkId: $linkId, designSessionToken: $designSessionToken, participantId: $participantId }) {
      success
      errors
      link { id token mode permission revokedAt }
    }
  }
`;

export const RECORD_EXPORT_MUTATION = `
  mutation RecordExport($designId: ID!, $designSessionToken: String!, $exportType: String!, $actorName: String!, $versionLabel: String, $designVersionId: ID, $estimateTotal: Float, $participantId: String!) {
    recordExport(input: { designId: $designId, designSessionToken: $designSessionToken, exportType: $exportType, actorName: $actorName, versionLabel: $versionLabel, designVersionId: $designVersionId, estimateTotal: $estimateTotal, participantId: $participantId }) {
      success
      errors
      designExport { id exportType exportedBy versionLabel estimateTotal createdAt }
    }
  }
`;
