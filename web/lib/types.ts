import { DesignRegion } from './regions';

export interface MaterialPreset {
    id: string;
    category: string; // DesignRegion or extended categories like 'trim'
    name: string;
    brand: string;
    colorFamily?: string;
    costBand?: '$' | '$$' | '$$$';
    sku?: string;
    unitType?: 'sqft' | 'linear_ft' | 'each';
    swatchHex: string;
    thumbnailUrl?: string;
}

export interface DesignEvent {
    id: string;
    designId: string;
    designSessionId?: string;
    actorName: string;
    actorRole?: 'contractor' | 'homeowner';
    actorPermission?: 'editor' | 'suggester' | 'viewer';
    eventType: 'apply_material' | 'suggest_material' | 'approve_suggestion' | 'reject_suggestion' | 'save_version' | 'restore_version' | 'revert_event';
    region: string; // Either a DesignRegion or an Element ID
    fromMaterialId?: string;
    toMaterialId?: string;
    note?: string;
    clientTxnId?: string;
    createdAt: string;
}

export interface DesignState {
    id: string;
    stateJson: Record<string, string>; // Keys can be DesignRegion or Element ID
    lastEventId?: number;
    lastSavedAt?: string;
}

export interface DesignVersion {
    id: string;
    designId: string;
    label: string;
    snapshotStateJson: Record<string, string>; // Keys can be DesignRegion or Element ID
    createdBy: string;
    createdAt: string;
}

export interface ProjectMessage {
    id: string;
    authorName: string;
    authorRole: 'contractor' | 'homeowner';
    body: string;
    createdAt: string;
}

export interface DesignElement {
    id: string;
    label: string;
    kind: string; // 'window', 'door', 'trim', 'roof', 'walls', 'garage'
    groupKey: string; // The fallback category
    maskUrl: string;
    sortOrder: number;
}

export interface Design {
    id: string;
    title: string;
    baseMediaUrl?: string;
    masksUrlPrefix?: string;
    elements?: DesignElement[];
    state: DesignState;
    versions: DesignVersion[];
    recentEvents: DesignEvent[];
    createdAt: string;
    finalVersionId?: number;
    maskReady?: boolean;
    projectMessages?: any[];
    regionLocks?: any[];
    regionComments?: RegionComment[];
    shareLinks?: ShareLink[];
}
export interface SessionMember {
    id: string;
    displayName: string;
    role: 'contractor' | 'homeowner';
    permission: 'editor' | 'suggester' | 'viewer';
    lastSeenAt?: string;
    participantId?: string;
}

export interface ShareLink {
    id: string;
    designId: string;
    token: string;
    mode: 'live' | 'view';
    permission?: 'editor' | 'suggester' | 'viewer';
    design: Design;
    designSessionToken?: string;
    expiresAt?: string;
    revokedAt?: string;
    lastAccessedAt?: string;
    createdAt: string;
}

export interface MutationResponse<T = any> {
    success: boolean;
    errors: string[];
    errorCode?: string;
    event?: DesignEvent;
    design?: Design;
    data?: T;
}

export interface RegionComment {
    id: string;
    region: string;
    authorName: string;
    authorRole: 'contractor' | 'homeowner';
    body: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface DesignExport {
    id: string;
    designId: string;
    designVersionId?: string;
    exportedBy: string;
    exportType: 'proposal' | 'summary';
    versionLabel?: string;
    estimateTotal?: number;
    createdAt: string;
}
