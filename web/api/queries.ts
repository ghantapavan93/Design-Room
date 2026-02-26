export const DESIGN_QUERY = `
  query Design($id: ID!, $eventsAfterId: Int) {
    design(id: $id, eventsAfterId: $eventsAfterId) {
      id
      title
      finalVersionId
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
      color_family
      cost_band
      sku
      unit_type
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

export const APPLY_MATERIAL_MUTATION = `
  mutation ApplyMaterial($input: ApplyMaterialInput!) {
    applyMaterial(input: $input) {
      success
      errors
      errorCode
      event { id eventType region toMaterialId fromMaterialId createdAt actorName }
    }
  }
`;

export const SUGGEST_MATERIAL_MUTATION = `
  mutation SuggestMaterial($input: SuggestMaterialInput!) {
    suggestMaterial(input: $input) {
      success
      errors
      errorCode
      event { id eventType region toMaterialId fromMaterialId createdAt actorName }
    }
  }
`;

export const APPROVE_SUGGESTION_MUTATION = `
  mutation ApproveSuggestion($input: ApproveSuggestionInput!) {
    approveSuggestion(input: $input) {
      success
      errors
      errorCode
      event { id eventType region toMaterialId fromMaterialId createdAt actorName }
    }
  }
`;

export const REJECT_SUGGESTION_MUTATION = `
  mutation RejectSuggestion($input: RejectSuggestionInput!) {
    rejectSuggestion(input: $input) {
      success
      errors
      errorCode
      event { id eventType region createdAt actorName }
    }
  }
`;

export const SAVE_VERSION_MUTATION = `
  mutation SaveVersion($input: SaveVersionInput!) {
    saveVersion(input: $input) {
      success
      errors
      event { id eventType createdAt actorName }
    }
  }
`;

export const RESTORE_VERSION_MUTATION = `
  mutation RestoreVersion($input: RestoreVersionInput!) {
    restoreVersion(input: $input) {
      success
      errors
      event { id eventType createdAt actorName }
    }
  }
`;

export const CREATE_LINK_MUTATION = `
  mutation CreateShareLink($input: CreateShareLinkInput!) {
    createShareLink(input: $input) {
      success
      errors
      link { token mode permission }
    }
  }
`;

export const REVERT_EVENT_MUTATION = `
  mutation RevertEvent($input: RevertEventInput!) {
    revertEvent(input: $input) {
      success
      errors
      event { id eventType region createdAt actorName }
    }
  }
`;

export const MARK_FINAL_MUTATION = `
  mutation MarkFinalVersion($input: MarkFinalVersionInput!) {
    markFinalVersion(input: $input) {
      success
      errors
    }
  }
`;

export const JOIN_SESSION_MUTATION = `
  mutation JoinDesignSession($input: JoinDesignSessionInput!) {
    joinDesignSession(input: $input) {
      success
      errors
      designSessionToken
      members
    }
  }
`;
