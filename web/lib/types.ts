import { DesignRegion } from './regions';

export interface MaterialPreset {
    id: string;
    category: DesignRegion;
    name: string;
    brand: string;
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
    region?: DesignRegion;
    fromMaterialId?: string;
    toMaterialId?: string;
    note?: string;
    clientTxnId?: string;
    createdAt: string;
}

export interface DesignState {
    id: string;
    stateJson: Record<DesignRegion, string>;
    lastEventId?: number;
    lastSavedAt?: string;
}

export interface DesignVersion {
    id: string;
    designId: string;
    label: string;
    snapshotStateJson: Record<DesignRegion, string>;
    createdBy: string;
    createdAt: string;
}

export interface Design {
    id: string;
    title: string;
    state: DesignState;
    versions: DesignVersion[];
    recentEvents: DesignEvent[];
    createdAt: string;
    finalVersionId?: number;
}

export interface SessionMember {
    id: string;
    displayName: string;
    role: 'contractor' | 'homeowner';
    permission: 'editor' | 'suggester' | 'viewer';
    lastSeenAt?: string;
}

export interface ShareLink {
    id: string;
    designId: string;
    token: string;
    mode: 'live' | 'view';
    permission?: 'editor' | 'suggester' | 'viewer';
    design: Design;
    designSessionToken?: string;
}

export interface MutationResponse<T = any> {
    success: boolean;
    errors: string[];
    errorCode?: string;
    event?: DesignEvent;
    design?: Design;
    data?: T;
}
