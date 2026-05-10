"use client"

import * as React from 'react';
import { useParams } from 'next/navigation';
import { EditorShell } from '@/components/design/editor_shell';
import { PreviewCanvas } from '@/components/design/preview_canvas';
import { MaterialPanel } from '@/components/design/material_panel';
import { BottomBar } from '@/components/design/bottom_bar';
import { LivePresenceBar } from '@/components/design/live_presence_bar';
import { DesignLedgerDrawer } from '@/components/design/design_ledger_drawer';
import { OptionsDrawer } from '@/components/design/options_drawer';
import { OptionCompare } from '@/components/design/option_compare';
import { TakeoffDrawer } from '@/components/design/takeoff_drawer';
import { ExportDialog } from '@/components/design/export_dialog';
import { ShareDialog } from '@/components/design/share_dialog';
import { WorkflowStrip } from '@/components/design/workflow_strip';
import { ConflictBanner } from '@/components/design/conflict_banner';
import { ProjectReadinessPanel, deriveReadiness, regionLabel, READINESS_META } from '@/components/design/project_readiness_panel';
import { RegionCommentsDrawer, RegionComment } from '@/components/design/region_comments_drawer';
import { ProjectChatDrawer, ProjectMessage } from '@/components/design/project_chat_drawer';
import { DesignRegion } from '@/lib/regions';
import { api } from '@/api/client';
import { CREATE_DESIGN_WORKSPACE_MUTATION, 
    DESIGN_QUERY,
    MATERIALS_QUERY,
    APPLY_MATERIAL_MUTATION,
    SUGGEST_MATERIAL_MUTATION,
    APPROVE_SUGGESTION_MUTATION,
    REJECT_SUGGESTION_MUTATION,
    REVERT_EVENT_MUTATION,
    SAVE_VERSION_MUTATION,
    RESTORE_VERSION_MUTATION,
    CREATE_LINK_MUTATION,
    MARK_FINAL_MUTATION, UNLOCK_DESIGN_MUTATION, JOIN_SESSION_MUTATION,
    HEARTBEAT_MUTATION,
    ADD_REGION_COMMENT_MUTATION,
    TOGGLE_REGION_LOCK_MUTATION,
    ADD_PROJECT_MESSAGE_MUTATION,
    RESOLVE_REGION_COMMENT_MUTATION,
    RECORD_EXPORT_MUTATION,
    REVOKE_SHARE_LINK_MUTATION
 } from '@/api/queries';
import { Design, MaterialPreset, DesignEvent, SessionMember, DesignVersion } from '@/lib/types';
import { generateIdempotencyKey } from '@/lib/idempotency';
import { toast } from '@/components/ui/toast';
import { formatTimeAgo } from '@/lib/time';
import { computeEstimate, MOCK_MEASUREMENTS } from '@/lib/estimate_engine';

const getWsUrl = () => {
    if (process.env.NEXT_PUBLIC_CABLE_URL) {
        return process.env.NEXT_PUBLIC_CABLE_URL;
    }
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const port = window.location.port === '3001' ? '3000' : window.location.port; 
        
        // Aggressive workaround for Chrome Windows IPv6 loopback drop bug on WebSockets:
        const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
        
        return `${protocol}//${host}:${port}/cable`;
    }
    return 'ws://127.0.0.1:3000/cable';
};

const RECONNECT_DELAY_MS = 2500;
const MAX_RECONNECT_DELAY_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 10000;


const DebugOverlay = ({ sessionToken, permission, pid, socketActive }: any) => (
    <div className="fixed bottom-4 left-4 p-3 bg-black/80 text-green-400 text-[10px] font-mono rounded z-50 pointer-events-none shadow-lg">
        <div>ID: {pid?.substring(0,6)}...</div>
        <div>LVL: {permission.toUpperCase()}</div>
        <div>SOCK: {socketActive ? 'CONNECTED' : 'WAITING'}</div>
    </div>
);

const useDebugMode = () => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debug') === '1' ||
        process.env.NEXT_PUBLIC_SHOW_DEBUG === 'true';
};


export default function DesignEditorPage() {
    const params = useParams();
    const designId = params.id as string;

    // Session State
    const [sessionToken, setSessionToken] = React.useState<string | null>(null);
    const [role, setRole] = React.useState<'contractor' | 'homeowner'>('contractor');
    const [permission, setPermission] = React.useState<'editor' | 'suggester' | 'viewer'>('editor');
    const [permissionVerified, setPermissionVerified] = React.useState(false);
    const [displayName, setDisplayName] = React.useState('Alex Contractor');

    // Observability State
    const [connectionMode, setConnectionMode] = React.useState<'websocket' | 'polling' | 'disconnected'>('disconnected');
    const [lastHeartbeatAt, setLastHeartbeatAt] = React.useState<string | null>(null);

    // Participant identity (stable across sessions)
    const participantIdRef = React.useRef<string>('');

    // App State
    const [workspaceId, setWorkspaceId] = React.useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        const params = new URLSearchParams(window.location.search);
        const designId = window.location.pathname.split('/').pop();
        return sessionStorage.getItem(`designWorkspaceId_${designId}`);
    });
    const [design, setDesign] = React.useState<Design | null>(null);
    const [socketActive, setSocketActive] = React.useState(false);
    const [presets, setPresets] = React.useState<Record<string, MaterialPreset>>({});
    const presetsRef = React.useRef<Record<string, MaterialPreset>>({});
    React.useEffect(() => { presetsRef.current = presets; }, [presets]);

    const presetsArr = React.useMemo(() => Object.values(presets), [presets]);
    const [loading, setLoading] = React.useState(true);
    const [connected, setConnected] = React.useState(false);
    const [members, setMembers] = React.useState<SessionMember[]>([]);

    // UI State
    const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
    const [chipPosition, setChipPosition] = React.useState<{ x: number, y: number } | null>(null);
    const [highlightedRegion, setHighlightedRegion] = React.useState<string | undefined>();
    const [isLedgerOpen, setIsLedgerOpen] = React.useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
    const [isTakeoffOpen, setIsTakeoffOpen] = React.useState(false);
    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const [isShareOpen, setIsShareOpen] = React.useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
    const [commentsRegion, setCommentsRegion] = React.useState<string | null>(null);

    // Region Lock State
    const [lockedRegions, setLockedRegions] = React.useState<{ region: string; lockedBy: string; expiresAt?: string }[]>([]);

    // Region Comments State (client-side demo — seeded with sample data)
    const [regionComments, setRegionComments] = React.useState<RegionComment[]>([]);

    // Project-Level Chat State
    const [isProjectChatOpen, setIsProjectChatOpen] = React.useState(false);
    const [projectMessages, setProjectMessages] = React.useState<ProjectMessage[]>([]);

    // Pending Suggestion State
    const [pendingSuggestions, setPendingSuggestions] = React.useState<{ region: string; preset: MaterialPreset; actorName: string; eventId: string }[]>([]);

    // Compare/Option State
    const [compareOption, setCompareOption] = React.useState<DesignVersion | null>(null);

    // Share State
    const [shareLinkLoading, setShareLinkLoading] = React.useState(false);
    const [shareLinkUrl, setShareLinkUrl] = React.useState<string | null>(null);
    const [shareLinks, setShareLinks] = React.useState<any[]>([]);

    // Conflict State
    const [conflictMsg, setConflictMsg] = React.useState<string | null>(null);
    const [conflictMaterial, setConflictMaterial] = React.useState<MaterialPreset | null>(null);
    const [conflictRegion, setConflictRegion] = React.useState<string | null>(null);
    const [conflictErrorCode, setConflictErrorCode] = React.useState<string | null>(null);
    const [conflictTheirMaterial, setConflictTheirMaterial] = React.useState<MaterialPreset | null>(null);

    // Success Animation State
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Progress State tracking
    const [compareViewed, setCompareViewed] = React.useState(false);
    const [takeoffViewed, setTakeoffViewed] = React.useState(false);
    const [exportDone, setExportDone] = React.useState(false);
    React.useEffect(() => { if (compareOption) setCompareViewed(true); }, [compareOption]);
    React.useEffect(() => { if (isTakeoffOpen) setTakeoffViewed(true); }, [isTakeoffOpen]);

    // Refs for websocket
    const socketRef = React.useRef<WebSocket | null>(null);
    const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const heartbeatRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = React.useRef(0);
    const shouldStopRef = React.useRef(false);
    const subscribedRef = React.useRef(false);
    const pingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize Session from sessionStorage (cache only — server verifies on join)
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            // Participant ID: stable identity across sessions
            let pid = localStorage.getItem('designRoomParticipantId');
            if (!pid) {
                pid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
                localStorage.setItem('designRoomParticipantId', pid);
            }
            participantIdRef.current = pid;

            const legacyKeys = ['designSessionToken', 'sessionRole', 'sessionPermission', 'shareToken'];
            legacyKeys.forEach(k => {
                if (sessionStorage.getItem(k)) sessionStorage.removeItem(k);
            });

            const storedToken = sessionStorage.getItem(`designSessionToken_${designId}`);
            const storedRole = sessionStorage.getItem(`sessionRole_${designId}`) as 'contractor' | 'homeowner' | null;
            const storedPermission = sessionStorage.getItem(`sessionPermission_${designId}`) as 'editor' | 'suggester' | 'viewer' | null;
            const currentShareToken = sessionStorage.getItem(`shareToken_${designId}`);

            // If we have a share token but the current role is 'contractor', or vice-versa,
            // we should be careful about using cached state.
            if (currentShareToken && storedRole === 'contractor') {
                // Clear the cached contractor token when joining via a share link
                sessionStorage.removeItem(`designSessionToken_${designId}`);
                setSessionToken(null);
                setRole('homeowner');
                setDisplayName('Sam Homeowner');
                setPermission('suggester');
            } else if (storedToken) {
                setSessionToken(storedToken);
                setRole(storedRole || 'homeowner');
                setPermission(storedPermission || 'suggester');
                setDisplayName(storedRole === 'homeowner' ? 'Sam Homeowner' : 'Alex Contractor');
            } else {
                // Default based on joining path
                const isGuest = !!currentShareToken;
                setRole(isGuest ? 'homeowner' : 'contractor');
                setDisplayName(isGuest ? 'Sam Homeowner' : 'Alex Contractor');
            }
        }
    }, []);

    
    // Initialize Workspace
    React.useEffect(() => {
        if (!designId || workspaceId) return;

        const hasShareToken = typeof window !== "undefined" && !!sessionStorage.getItem(`shareToken_${designId}`);
        if (hasShareToken) return;

        async function createWorkspace() {
            try {
                const res = await api.graphqlRequest<any>(CREATE_DESIGN_WORKSPACE_MUTATION, {
                    designId,
                    participantId: participantIdRef.current || 'unknown'
                });
                const id = res?.createDesignWorkspace?.workspace?.id;
                if (id) {
                    sessionStorage.setItem(`designWorkspaceId_${designId}`, id);
                    handleInitialData(res.createDesignWorkspace);
                    setWorkspaceId(id);
                }
            } catch (e) {
                console.error("Failed to create workspace", e);
            }
        }
        createWorkspace();
    }, [designId, workspaceId]);

    // Fetch Initial Data
    React.useEffect(() => {
        async function load() {
            if (!workspaceId || design) return;
            if (!workspaceId) return;
            try {
                const [designRes, matRes] = await Promise.all([
                    api.graphqlRequest<any>(DESIGN_QUERY, { id: designId, workspaceId }),
                    api.graphqlRequest<any>(MATERIALS_QUERY)
                ]);

                const map: Record<string, MaterialPreset> = {};
                const arr: MaterialPreset[] = [];
                matRes.materials.forEach((m: MaterialPreset) => {
                    map[m.id] = m;
                    arr.push(m);
                });

                setPresets(map);
                setDesign(designRes.design);

                const events = designRes.design.recentEvents;
                if (events && events.length > 0) {
                    const processedRegions = new Set<string>();
                    const suggestions: any[] = [];
                    
                    events.forEach((e: DesignEvent) => {
                        if (!processedRegions.has(e.region)) {
                            processedRegions.add(e.region);
                            if (e.eventType === 'suggest_material') {
                                const presetId = String(e.toMaterialId || '');
                                if (map[presetId]) {
                                    suggestions.push({
                                        region: e.region,
                                        preset: map[presetId],
                                        actorName: e.actorName,
                                        eventId: e.id
                                    });
                                }
                            }
                        }
                    });
                    
                    if (suggestions.length > 0) setPendingSuggestions(suggestions);
                }

                // Initial Persistence State
                if (designRes.design.regionLocks) {
                    setLockedRegions(designRes.design.regionLocks.map((l: any) => ({
                        region: l.region,
                        lockedBy: l.lockedBy,
                        expiresAt: l.expiresAt
                    })));
                }
                if (designRes.design.regionComments) {
                    setRegionComments(designRes.design.regionComments.map((c: any) => ({
                        id: c.id,
                        region: c.region,
                        authorName: c.authorName,
                        authorRole: c.authorRole as any,
                        body: c.body,
                        createdAt: c.createdAt,
                        resolvedAt: c.resolvedAt || undefined
                    })));
                }
                if (designRes.design.projectMessages) {
                    setProjectMessages(designRes.design.projectMessages.map((m: any) => ({
                        id: m.id,
                        authorName: m.authorName,
                        authorRole: m.authorRole as any,
                        body: m.body,
                        createdAt: m.createdAt
                    })));
                }
                if (designRes.design.shareLinks) {
                    setShareLinks(designRes.design.shareLinks);
                }
            } catch (e) {
                console.error(e);
                toast({ title: "Failed to load design", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [designId, workspaceId]);

    
    // Lock Expiry Cleanup Hook
    React.useEffect(() => {
        const interval = setInterval(() => {
            setLockedRegions(prev => {
                const now = Date.now();
                const valid = prev.filter((lock: any) => lock.expiresAt ? new Date(lock.expiresAt).getTime() > now : true);
                if (valid.length !== prev.length) return valid;
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);


    
    const handleInitialData = (data: any) => {
        if (!data?.design || !data?.materials) return;
        const map: Record<string, any> = {};
        data.materials.forEach((m: any) => { map[m.id] = m; });
        setPresets(map);
        setDesign(data.design);
        if (data.design.regionLocks) setLockedRegions(data.design.regionLocks);
        if (data.design.regionComments) setRegionComments(data.design.regionComments);
        if (data.design.projectMessages) setProjectMessages(data.design.projectMessages);
        if (data.design.shareLinks) setShareLinks(data.design.shareLinks);
        setLoading(false);
    };

    const isJoiningRef = React.useRef(false);

    // Join Design Session Handshake
    React.useEffect(() => {
        if (!designId || isJoiningRef.current) return;
        
        // If we have a session token already, only skip if it's verified.
        if (sessionToken && permissionVerified) return;

        async function join() {
            isJoiningRef.current = true;
            try {
                const sessionShareToken = sessionStorage.getItem(`shareToken_${designId}`) || sessionStorage.getItem('shareToken');
                const pId = participantIdRef.current;
                
                // Determine the correct name to send to the server
                const nameToSend = displayName || (sessionShareToken ? 'Sam Homeowner' : 'Alex Contractor');

                const res = await api.graphqlRequest<any>(JOIN_SESSION_MUTATION, {
                    designId, 
                    displayName: nameToSend, 
                    shareToken: sessionShareToken || undefined, 
                    participantId: pId || undefined, workspaceId: workspaceId || undefined
                });

                const payload = res.joinDesignSession;
                if (!payload.success || !payload.designSessionToken) {
                    // Clear broken state
                    sessionStorage.removeItem(`designSessionToken_${designId}`);
                    setSessionToken(null);
                    setPermissionVerified(true);
                    return;
                }

                const token = payload.designSessionToken as string;
                const serverPermission = payload.effectivePermission || permission;
                const serverRole = serverPermission === 'editor' ? 'contractor' : 'homeowner';
                
                // Save scoped to this design to prevent tab crossover
                sessionStorage.setItem(`designSessionToken_${designId}`, token);
                sessionStorage.setItem(`sessionRole_${designId}`, serverRole);
                sessionStorage.setItem(`sessionPermission_${designId}`, serverPermission);

                setSessionToken(token);
                setRole(serverRole);
                setPermission(serverPermission);
                setDisplayName(nameToSend);
                setPermissionVerified(true);

                if (payload.members) setMembers(payload.members);
                if (payload.workspaceId) {
                    sessionStorage.setItem(`designWorkspaceId_${designId}`, payload.workspaceId);
                    setWorkspaceId(payload.workspaceId);
                }
                if (payload.design && payload.materials) {
                    handleInitialData(payload);
                }
            } catch (e) {
                console.error("JOIN EXCEPTION:", e);
            } finally {
                isJoiningRef.current = false;
            }
        }

        join();
    }, [designId, sessionToken, permissionVerified, displayName]);

    // Websocket
    React.useEffect(() => {
        if (!designId || !sessionToken || !permissionVerified) return;

        shouldStopRef.current = false;

        const cleanupTimers = () => {
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
            if (pingTimeoutRef.current) {
                clearTimeout(pingTimeoutRef.current);
                pingTimeoutRef.current = null;
            }
        };

        const connectWs = () => {
            if (shouldStopRef.current) return;

            subscribedRef.current = false;
            setConnected(false);

            const tokenParam = sessionToken ? `?token=${encodeURIComponent(sessionToken)}` : "";
            const wsUrl = `${getWsUrl()}${tokenParam}`;

            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                const identifier = JSON.stringify({ channel: "DesignRoomChannel", design_id: designId, workspace_id: workspaceId });
                ws.send(JSON.stringify({ command: "subscribe", identifier }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "ping") {
                        if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
                        pingTimeoutRef.current = setTimeout(() => {
                            try { ws.close(); } catch {}
                        }, 10000);
                        return;
                    }

                    if (data.type === "confirm_subscription") {
                        subscribedRef.current = true;
                        setConnected(true);
                        setConnectionMode('websocket');
                        reconnectAttemptRef.current = 0;

                        if (pollRef.current) {
                            clearInterval(pollRef.current);
                            pollRef.current = null;
                        }
                        return;
                    }

                    if (data.type === "reject_subscription") {
                        subscribedRef.current = false;
                        setConnected(false);
                        try { ws.close(); } catch { }
                        
                        // If the server rejects our subscription, our session token is likely stale or invalid.
                        // Trigger silent reconnect/rejoin flow:
                        setPermissionVerified(false);
                        return;
                    }

                    if (data.message?.members) {
                        setMembers(data.message.members);
                        return;
                    }

                    if (data.message?.type) {
                        const m = data.message;
                        if (m.type === 'region_lock') {
                            setLockedRegions(prev => [...prev.filter(l => l.region !== m.region), { region: m.region, lockedBy: m.lockedBy, expiresAt: m.expiresAt }]);
                        } else if (m.type === 'region_unlock') {
                            setLockedRegions(prev => prev.filter(l => l.region !== m.region));
                        } else if (m.type === 'region_comment') {
                            setRegionComments(prev => {
                                const incoming = { ...m.comment, id: String(m.comment.id) };
                                return [...prev.filter(c => c.id !== incoming.id && c.id !== incoming.clientTxnId), incoming];
                            });
                        } else if (m.type === 'region_comment_resolved') {
                            setRegionComments(prev => prev.map(c =>
                                String(c.id) === String(m.comment.id)
                                    ? { ...c, resolvedAt: m.comment.resolved_at || undefined }
                                    : c
                            ));
                        } else if (m.type === 'project_message') {
                            setProjectMessages(prev => {
                                const incoming = { ...m.message, id: String(m.message.id) };
                                return [...prev.filter(msg => msg.id !== incoming.id && msg.id !== incoming.clientTxnId), incoming];
                            });
                        } else if (m.type === 'status_update') {
                            setDesign(prev => prev ? { ...prev, finalVersionId: m.message.final_version_id } : null);
                        }
                    }

                    if (data.message?.event) {
                        handleIncomingEvent(data.message.event, data.message.state, data.message.version);
                    }
                } catch {
                    // ignore noisy frames
                }
            };

            ws.onerror = () => {
                // force close so onclose handles reconnect path
                try { ws.close(); } catch { }
            };

            ws.onclose = () => {
                subscribedRef.current = false;
                setConnected(false);
                setConnectionMode('disconnected');

                cleanupTimers();

                if (shouldStopRef.current) return;

                // start polling quickly so UI stays fresh during reconnect
                startPolling();

                // Exponential backoff for WebSocket reconnection
                const delay = Math.min(RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptRef.current), MAX_RECONNECT_DELAY_MS);
                reconnectAttemptRef.current += 1;

                reconnectRef.current = setTimeout(() => {
                    connectWs();
                }, delay);
            };
        };

        connectWs();

        heartbeatRef.current = setInterval(() => {
            if (!sessionToken) return;

            api.graphqlRequest(
                HEARTBEAT_MUTATION,
                { designSessionToken: sessionToken, participantId: participantIdRef.current }
            ).then((r: any) => {
                const payload = r.heartbeat;
                if (payload?.members) setMembers(payload.members);
                setLastHeartbeatAt(new Date().toISOString());
            }).catch(() => { });

        }, HEARTBEAT_INTERVAL_MS);

        return () => {
            shouldStopRef.current = true;
            cleanupTimers();

            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
            if (socketRef.current) {
                try { socketRef.current.close(); } catch { }
                socketRef.current = null;
            }
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [designId, sessionToken, permissionVerified, workspaceId]);

    const startPolling = () => {
        if (pollRef.current) return;
        setConnectionMode('polling');
        pollRef.current = setInterval(async () => {
            try {
                const res = await api.graphqlRequest<any>(DESIGN_QUERY, { id: designId, workspaceId });
                if (res.design) setDesign(res.design);
            } catch { }
        }, 2500);
    };

    const handleIncomingEvent = (ev: DesignEvent, newState: any, newVersion?: DesignVersion) => {
        if (ev.eventType === 'suggest_material') {
            const presetId = String(ev.toMaterialId || '');
            const preset = presetsRef.current[presetId];
            if (preset) {
                setPendingSuggestions(prev => {
                    const filtered = prev.filter(s => s.eventId !== ev.id);
                    return [...filtered, { region: ev.region, preset, actorName: ev.actorName, eventId: ev.id }];
                });
                if (ev.actorName !== displayName) toast({ title: `${ev.actorName} suggested a new material for ${ev.region}` });
            }

            // Still insert into ledger array
            setDesign(prev => {
                if (!prev) return prev;
                const exists = prev.recentEvents.find(e => e.id === ev.id);
                if (exists) return prev;
                return { ...prev, recentEvents: [ev, ...prev.recentEvents] };
            });
        } else {
            if (ev.eventType === 'approve_suggestion' || ev.eventType === 'reject_suggestion') setPendingSuggestions(prev => prev.filter(s => s.region !== ev.region));
            setDesign(prev => {
                if (!prev) return prev;
                const newVersions = newVersion ? [newVersion, ...prev.versions] : prev.versions;
                const exists = prev.recentEvents.find(e => e.id === ev.id);
                const eventsList = exists ? prev.recentEvents : [ev, ...prev.recentEvents];

                // If newState is just the JSON hash (from backend), wrap it. 
                // If it's already a full state object, use it.
                const updatedState = (newState && !newState.stateJson)
                    ? { ...prev.state, stateJson: newState, lastEventId: ev.id, lastSavedAt: new Date().toISOString() }
                    : (newState || prev.state);

                return { ...prev, state: updatedState, versions: newVersions, recentEvents: eventsList };
            });
        }
    };

    // ----- Actions -----
    const refreshDesignData = async () => {
        try {
            const res = await api.graphqlRequest<any>(DESIGN_QUERY, { id: designId, workspaceId });
            if (res.design) {
                setDesign(res.design);
                // Atomic update for share links shared across UI components
                if (res.design.shareLinks) {
                    setShareLinks(res.design.shareLinks);
                }
            }
            return res.design;
        } catch (err) {
            console.error('[RefreshDesignData] Failed:', err);
            return null;
        }
    };

    const handleMaterialSelect = async (regions: string[], preset: MaterialPreset) => {
        console.log('[DEBUG] handleMaterialSelect Entry:', { regions, presetId: preset.id, permission, permissionVerified });
        if (permission === 'viewer' || !permissionVerified) {
            console.log('[DEBUG] handleMaterialSelect Bailed: viewer or not verified');
            return;
        }

        const newStateJson = { ...design?.state?.stateJson };
        regions.forEach(r => {
            if (preset.id === 'REMOVE') {
                delete newStateJson[r];
            } else {
                newStateJson[r] = preset.id;
            }
        });

        if (permission === 'editor') {
            // Optimistic
            setDesign(prev => prev ? { ...prev, state: { ...prev.state, stateJson: newStateJson as any } } : null);
            const results: { region: string; success: boolean; error?: string }[] = [];
            try {
                let currentVersionId = design?.state?.lastEventId ? String(design.state.lastEventId) : undefined;
                for (const r of regions) {
                    const txnId = generateIdempotencyKey();

                    const matchingSuggestion = pendingSuggestions.find(s => s.region === r || (r === 'windows' && s.region.startsWith('window_')));
                    if (matchingSuggestion) {
                        setPendingSuggestions(prev => prev.filter(s => s.eventId !== matchingSuggestion.eventId));
                    }

                    const res = await api.graphqlRequest<any>(APPLY_MATERIAL_MUTATION, {
                        designId,
                        region: r,
                        materialId: preset.id === 'REMOVE' ? null : preset.id,
                        actorName: displayName,
                        actorRole: role,
                        participantId: participantIdRef.current,
                        clientTxnId: txnId,
                        designSessionToken: sessionToken,
                        baseVersion: currentVersionId
                    , workspaceId: workspaceId || undefined});
                    if (res.applyMaterial.success) {
                        // Update version from server response for next iteration (avoids cascade STALE_VERSION)
                        if (res.applyMaterial.event?.id) currentVersionId = String(res.applyMaterial.event.id);
                        results.push({ region: r, success: true });
                    } else {
                        results.push({ region: r, success: false, error: res.applyMaterial.errors?.[0] });
                        if (res.applyMaterial.errorCode === 'LOCKED') {
                            setConflictMsg(res.applyMaterial.errors[0]);
                            setConflictMaterial(preset);
                            setConflictRegion(r);
                            setConflictErrorCode('LOCKED');
                        } else if (res.applyMaterial.errorCode === 'STALE_VERSION') {
                            // Re-fetch state to get latest version before continuing
                            try {
                                const refreshRes = await api.graphqlRequest<any>(DESIGN_QUERY, { id: designId, workspaceId });
                                if (refreshRes.design?.state?.lastEventId) {
                                    currentVersionId = String(refreshRes.design.state.lastEventId);
                                }
                            } catch { /* continue with stale version */ }
                            setConflictRegion(r);
                            setConflictMaterial(preset);
                            setConflictTheirMaterial(res.applyMaterial.event ? presets[String(res.applyMaterial.event.toMaterialId)] || null : null);
                            setConflictMsg(res.applyMaterial.errors[0] || 'State is out of date. Keep yours?');
                            setConflictErrorCode('STALE_VERSION');
                        } else {
                            // Don't stop loop — continue to remaining regions
                        }
                    }
                }
                // Show partial success summary for multi-region
                if (regions.length > 1) {
                    const successes = results.filter(r => r.success).length;
                    const failures = results.filter(r => !r.success);
                    if (failures.length > 0 && successes > 0) {
                        const failedNames = failures.map(f => f.region).join(', ');
                        toast({ title: `Applied to ${successes}/${regions.length} regions. Failed: ${failedNames}`, variant: 'destructive' });
                    } else if (failures.length > 0 && successes === 0) {
                        toast({ title: `Failed to apply to all ${regions.length} regions`, variant: 'destructive' });
                    }
                }
                await refreshDesignData();
            } catch { 
                toast({ title: 'Network error', variant: 'destructive' }); 
                await refreshDesignData(); 
            }
        } else if (permission === 'suggester') {
            console.log('[DEBUG] handleMaterialSelect Suggester Branch Start');
            try {
                await Promise.all(regions.map(async r => {
                    const txnId = generateIdempotencyKey();
                    console.log('[DEBUG] Sending SUGGEST_MATERIAL_MUTATION for region:', r);
                    const res = await api.graphqlRequest<any>(SUGGEST_MATERIAL_MUTATION, {
                        designId, region: r, materialId: preset.id === 'REMOVE' ? null : preset.id, actorName: displayName, actorRole: role, participantId: participantIdRef.current, clientTxnId: txnId, designSessionToken: sessionToken
                    , workspaceId: workspaceId || undefined});
                    console.log('[DEBUG] SUGGEST_MATERIAL_MUTATION Response:', res);
                    if (res?.suggestMaterial?.success) {
                        console.log('[DEBUG] Suggestion Success - setting local state');
                        setPendingSuggestions(prev => [...prev, { region: r, preset, actorName: displayName, eventId: res.suggestMaterial.event.id }]);
                    } else {
                        console.log('[DEBUG] Suggestion Failure:', res?.suggestMaterial?.errors);
                        toast({ title: res?.suggestMaterial?.errors?.[0] || 'Unknown error', variant: 'destructive' });
                    }
                }));
                console.log('[DEBUG] All suggestions processed - firing toast');
                toast({ title: 'Suggestions sent to contractor', variant: 'success' });
            } catch (err) { 
                console.error('[DEBUG] Suggestion Error:', err);
                toast({ title: 'Network error', variant: 'destructive' }); 
            }
        }
    };



    const handleSaveVersion = async (label: string) => {
        try {
            await api.graphqlRequest<any>(SAVE_VERSION_MUTATION, {
                designId, label, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken, participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            toast({ title: `Saved version: ${label}`, variant: 'success' });
            refreshDesignData();
        } catch { toast({ title: 'Failed to save version', variant: 'destructive' }); }
    };

    const handleRestoreVersion = async (versionId: string) => {
        try {
            await api.graphqlRequest<any>(RESTORE_VERSION_MUTATION, {
                versionId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken, participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            toast({ title: 'Design restored', variant: 'success' });
            setCompareOption(null);
            setIsOptionsOpen(false);
            refreshDesignData();
        } catch { toast({ title: 'Failed to restore', variant: 'destructive' }); }
    };

    const handleMarkFinal = async (versionId: string) => {
        try {
            const res = await api.graphqlRequest<any>(MARK_FINAL_MUTATION, {
                versionId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken, participantId: participantIdRef.current
            });
            if (res.markFinalVersion.success) {
                setShowSuccess(true);
                setIsOptionsOpen(false);
                refreshDesignData();
                setTimeout(() => setShowSuccess(false), 3500);
            } else {
                toast({ title: res.markFinalVersion.errors[0], variant: 'destructive' });
            }
        } catch { toast({ title: 'Failed to mark final', variant: 'destructive' }); }
    };

    const handleUnlockDesign = async () => {
        try {
            const res = await api.graphqlRequest<any>(UNLOCK_DESIGN_MUTATION, {
                designId: designId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken, participantId: participantIdRef.current
            });
            if (res.unlockDesign.success) {
                toast({ title: 'Design Unlocked', variant: 'success' });
                refreshDesignData();
            } else {
                toast({ title: res.unlockDesign.errors[0], variant: 'destructive' });
            }
        } catch { toast({ title: 'Failed to unlock', variant: 'destructive' }); }
    };

    const handleRevertEvent = async (eventId: string) => {
        if (!sessionToken) return;
        setIsLedgerOpen(false);
        try {
            const res = await api.graphqlRequest<any>(REVERT_EVENT_MUTATION, {
                eventId,
                designSessionToken: sessionToken,
                actorName: displayName,
                actorRole: role,
                participantId: participantIdRef.current,
                clientTxnId: generateIdempotencyKey()
            });
            if (res.revertEvent.success) {
                toast({ title: "Action undone", variant: "success" });
                refreshDesignData();
            } else {
                toast({ title: res.revertEvent.errors[0], variant: 'destructive' });
            }
        } catch {
            toast({ title: "Failed to revert", variant: "destructive" });
        }
    };

    const handleApproveSuggestion = async (eventId: string) => {
        if (!sessionToken) return;
        const txnId = generateIdempotencyKey();
        setPendingSuggestions(prev => prev.filter(s => s.eventId !== eventId)); // optimistic hide
        try {
            const res = await api.graphqlRequest<any>(APPROVE_SUGGESTION_MUTATION, {
                eventId, designSessionToken: sessionToken, clientTxnId: txnId, actorName: displayName, actorRole: role, participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            if (!res.approveSuggestion.success) toast({ title: res.approveSuggestion.errors[0], variant: 'destructive' });
            else toast({ title: "Suggestion approved" });
        } catch {
            toast({ title: "Failed to approve suggestion", variant: "destructive" });
        }
    };

    const handleRejectSuggestion = async (eventId: string) => {
        if (!sessionToken) return;
        const txnId = generateIdempotencyKey();
        setPendingSuggestions(prev => prev.filter(s => s.eventId !== eventId)); // optimistic hide
        try {
            const res = await api.graphqlRequest<any>(REJECT_SUGGESTION_MUTATION, {
                eventId, designSessionToken: sessionToken, clientTxnId: txnId, actorName: displayName, actorRole: role, participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            if (!res.rejectSuggestion.success) toast({ title: res.rejectSuggestion.errors[0], variant: 'destructive' });
            else toast({ title: "Suggestion rejected" });
        } catch {
            toast({ title: "Failed to reject suggestion", variant: "destructive" });
        }
    };

    const handleAddComment = async (region: string, body: string) => {
        if (!sessionToken) return;
        const txnId = generateIdempotencyKey();
        const optimisticComment = {
            id: txnId,
            region,
            authorName: displayName,
            authorRole: role as any,
            body,
            createdAt: new Date().toISOString()
        };
        setRegionComments(prev => [...prev, optimisticComment]);
        try {
            const res = await api.graphqlRequest<any>(ADD_REGION_COMMENT_MUTATION, {
                designId, region, body, designSessionToken: sessionToken, clientTxnId: txnId, actorName: displayName, participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            if (!res.addRegionComment.success) {
                toast({ title: res.addRegionComment.errors[0], variant: 'destructive' });
                setRegionComments(prev => prev.filter(c => c.id !== txnId));
            } else if (res.addRegionComment.regionComment) {
                const c = res.addRegionComment.regionComment;
                setRegionComments(prev => prev.map(x => x.id === txnId ? c : x));
            }
        } catch {
            toast({ title: "Failed to post comment", variant: "destructive" });
            setRegionComments(prev => prev.filter(c => c.id !== txnId));
        }
    };

    const handleAddProjectMessage = async (body: string) => {
        if (!sessionToken) {
            return;
        }
        const txnId = generateIdempotencyKey();
        const optimisticMsg = {
            id: txnId,
            authorName: displayName,
            authorRole: role as any,
            body,
            createdAt: new Date().toISOString()
        };
        setProjectMessages(prev => [...prev, optimisticMsg]);
        try {
            const res = await api.graphqlRequest<any>(ADD_PROJECT_MESSAGE_MUTATION, {
                designId, body, designSessionToken: sessionToken, clientTxnId: txnId, actorName: displayName, participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            if (!res.addProjectMessage.success) {
                toast({ title: `Failed to send message: ${res.addProjectMessage.errors[0]}`, variant: 'destructive' });
                setProjectMessages(prev => prev.filter(m => m.id !== txnId));
            } else if (res.addProjectMessage.projectMessage) {
                // Server confirmation received
                const m = res.addProjectMessage.projectMessage;
                setProjectMessages(prev => prev.map(x => x.id === txnId ? m : x));
            }
        } catch (e: any) {
            toast({ title: "Network error sending message.", variant: "destructive" });
            setProjectMessages(prev => prev.filter(m => m.id !== txnId));
        }
    };

    const handleCreateShareLink = async (mode: 'live' | 'view', targetPermission: 'editor' | 'suggester' | 'viewer') => {
        setShareLinkLoading(true);
        try {
            const res = await api.graphqlRequest<any>(CREATE_LINK_MUTATION, {
                designId,
                mode,
                permission: mode === 'live' ? targetPermission : undefined,
                designSessionToken: sessionToken,
                participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
            if (res.createShareLink.success) {
                const link = res.createShareLink.link;
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const fullUrl = `${origin}/design/${mode}/${link.token}`;

                // 1. Show the generated URL in the success banner immediately
                setShareLinkUrl(fullUrl);

                // 2. Optimistically insert into the Active Links list RIGHT NOW
                //    so it appears at the top without waiting for a full refresh
                const optimisticLink = {
                    id: link.id || `optimistic-${Date.now()}`,
                    token: link.token,
                    mode: link.mode || mode,
                    permission: link.permission || (mode === 'live' ? targetPermission : 'viewer'),
                    createdAt: new Date().toISOString(),
                    revokedAt: null,
                    expiresAt: null,
                    lastAccessedAt: null,
                    designId,
                    design: design as any,
                };
                setShareLinks(prev => [optimisticLink, ...prev]);

                // 3. Background refresh to get confirmed server state (non-blocking)
                refreshDesignData();
            } else {
                const errMsg = res.createShareLink.errors?.[0] || 'Failed to create link';
                toast({ title: errMsg, variant: 'destructive' });
                setShareLinkUrl(null);
            }
        } catch {
            toast({ title: 'Failed to create link', variant: 'destructive' });
            setShareLinkUrl(null);
        } finally {
            setShareLinkLoading(false);
        }
    };

    const handleRevokeShareLink = async (linkId: string) => {
        if (!sessionToken) return;
        try {
            const res = await api.graphqlRequest<any>(REVOKE_SHARE_LINK_MUTATION, {
                linkId, designSessionToken: sessionToken, participantId: participantIdRef.current
            });
            if (res.revokeShareLink.success) {
                toast({ title: 'Link revoked', variant: 'success' });
                refreshDesignData();
            } else {
                toast({ title: res.revokeShareLink.errors?.[0] || 'Failed to revoke link', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Network error revoking link', variant: 'destructive' });
        }
    };

    const handleResolveComment = async (commentId: string, resolve: boolean) => {
        if (!sessionToken) return;
        try {
            const res = await api.graphqlRequest<any>(RESOLVE_REGION_COMMENT_MUTATION, {
                commentId, designSessionToken: sessionToken, resolve, participantId: participantIdRef.current
            });
            if (res.resolveRegionComment.success && res.resolveRegionComment.regionComment) {
                const updated = res.resolveRegionComment.regionComment;
                setRegionComments(prev => prev.map(c =>
                    c.id === updated.id ? { ...c, resolvedAt: updated.resolvedAt || undefined } : c
                ));
                toast({ title: resolve ? 'Comment resolved' : 'Comment reopened', variant: 'success' });
            } else {
                toast({ title: res.resolveRegionComment.errors?.[0] || 'Failed', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Failed to update comment', variant: 'destructive' });
        }
    };

    const handleRecordExport = async (exportType: 'proposal' | 'summary') => {
        if (!sessionToken || !design) return;
        try {
            const est = computeEstimate(design.state.stateJson, presets, MOCK_MEASUREMENTS);
            await api.graphqlRequest<any>(RECORD_EXPORT_MUTATION, {
                designId,
                designSessionToken: sessionToken,
                exportType,
                actorName: displayName,
                estimateTotal: est.total,
                versionLabel: design.finalVersionId ? design.versions.find(v => String(v.id) === String(design.finalVersionId))?.label : undefined,
                designVersionId: design.finalVersionId ? String(design.finalVersionId) : undefined,
                participantId: participantIdRef.current
            , workspaceId: workspaceId || undefined});
        } catch {
            // Export recording is best-effort — don't block the export
        }
    };

    // Lock expiry cleanup (presentation-only — backend is source of truth)
    React.useEffect(() => {
        const interval = setInterval(() => {
            setLockedRegions(prev => {
                const now = Date.now();
                return prev.filter(l => !l.expiresAt || new Date(l.expiresAt).getTime() > now);
            });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleUndo = () => {
        const revertible = design?.recentEvents?.find(e => e.eventType === 'apply_material' || e.eventType === 'revert_event');
        if (revertible) {
            handleRevertEvent(revertible.id);
        } else {
            toast({ title: "Nothing to undo" });
        }
    };

    // ── Hooks that must run unconditionally (before any early return) ─────────
    const currentEstimate = React.useMemo(
        () => computeEstimate(design?.state?.stateJson ?? {}, presets, MOCK_MEASUREMENTS).total,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [design?.state?.stateJson, presets]
    );
    const scopeChips = React.useMemo(
        () => Object.entries(design?.state?.stateJson ?? {}).map(([region, matId]) => ({
            region,
            label: regionLabel(region),
            preset: presets[matId] ?? null,
        })).filter(c => c.preset !== null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [design?.state?.stateJson, presets]
    );

    if (loading || !design) {
        return (
            <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="spinner" />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading editor...</p>
                </div>
            </div>
        );
    }

    // Mask readiness gate
    if (design.maskReady === false) {
        return (
            <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-5 max-w-md text-center px-6">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                        <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Processing Your Design</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We're generating the region masks for this project. This design isn't ready for editing yet. Please check back shortly.</p>
                    </div>
                    <a href="/projects" className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: 'var(--accent)', color: '#fff' }}>Back to Projects</a>
                </div>
            </div>
        );
    }

    // ── Workflow / readiness derived state (hooks already called above) ────────
    const readinessState = deriveReadiness(
        design.state.stateJson ?? {},
        design.versions ?? [],
        pendingSuggestions,
        design.finalVersionId ? String(design.finalVersionId) : null,
        currentEstimate,
        exportDone
    );
    const readinessMeta = READINESS_META[readinessState];
    // Keep legacy string for components that still expect it
    const statusChip = readinessMeta.label;
    const lastSavedText = design.state.lastSavedAt ? `Saved ${formatTimeAgo(design.state.lastSavedAt)}` : 'Unsaved';

    const isStep1 = selectedRegions.length > 0;
    const isStep2 = Object.keys(design.state.stateJson || {}).length > 0;
    const isStep3 = (design.versions && design.versions.length > 0);
    const isStep4 = compareViewed;
    const isStep5 = lockedRegions.length > 0;
    const isStep6 = takeoffViewed;
    const isStep7 = exportDone;

    const completed = [isStep1, isStep2, !!isStep3, isStep4, isStep5, isStep6, isStep7];
    let activeIndex = 0;
    if (isStep1) activeIndex = 1;
    if (isStep2) activeIndex = 2;
    if (isStep3) activeIndex = 3;
    if (isStep4) activeIndex = 4;
    if (isStep5) activeIndex = 5;
    if (isStep6) activeIndex = 6;
    if (isStep7) activeIndex = 6;

    const progress = { completed, activeIndex };

    return (
        <EditorShell>
            {/* Top Bar */}
            <div
                className="h-14 px-6 flex items-center justify-between shrink-0 z-20"
                style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
            >
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-2 mr-2" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </a>
                    <h1 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{design.title}</h1>
                    <span
                        className="pill text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm"
                        style={{
                            background: readinessMeta.bg,
                            color: readinessMeta.color,
                            border: `1px solid ${readinessMeta.border}`
                        }}
                    >
                        {readinessMeta.label}
                    </span>
                    {/* Role badge — makes permission visible at a glance during demo */}
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest"
                        style={{
                            background: permission === 'editor' ? 'rgba(99,102,241,0.12)' : permission === 'suggester' ? 'rgba(249,115,22,0.12)' : 'rgba(107,114,128,0.12)',
                            color: permission === 'editor' ? '#818cf8' : permission === 'suggester' ? '#fb923c' : '#9ca3af',
                            border: permission === 'editor' ? '1px solid rgba(99,102,241,0.25)' : permission === 'suggester' ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(107,114,128,0.25)'
                        }}
                    >
                        {permission === 'editor' ? 'Editor' : permission === 'suggester' ? 'Suggester' : 'Viewer'}
                    </span>
                </div>



                <div className="flex items-center gap-3">
                    {permission === 'editor' && (
                        <>
                             <button
                                 onClick={() => setIsShareOpen(true)}
                                 className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                 style={{ border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                             >
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                 </svg>
                                 Invite
                             </button>
                             <button
                                 onClick={() => setIsExportOpen(true)}
                                 className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                 style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                             >
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 Export
                             </button>
                            <div className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />
                        </>
                    )}
                    <LivePresenceBar members={members} isConnected={connected} onToggleChat={() => setIsProjectChatOpen(true)} />
                    <div className="w-px h-5" style={{ background: 'var(--border-subtle)' }} />
                    <a
                        href="/ideas"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ color: 'var(--text-muted)', background: 'transparent' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Ideas
                    </a>
                    <a
                        href="/interiors"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ color: 'var(--text-muted)', background: 'transparent' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Interiors
                    </a>
                </div>
            </div>

            <WorkflowStrip
                progress={progress}
                onStepClick={(idx) => {
                    if (idx === 2 || idx === 3) setIsOptionsOpen(true);
                    if (idx === 5 || idx === 6) {
                        setIsTakeoffOpen(true);
                        // Delay slighty to let drawer open, then attempt to scroll to export if idx 7 (Export)
                        if (idx === 6) {
                            setTimeout(() => {
                                const exportBtn = document.getElementById('export-proposal-btn');
                                if (exportBtn) exportBtn.scrollIntoView({ behavior: 'smooth' });
                            }, 300);
                        }
                    }
                }}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                <MaterialPanel
                    presets={presetsArr}
                    selectedRegions={selectedRegions}
                    onRegionChange={setSelectedRegions}
                    selectedMaterials={(design.state.stateJson || {})}
                    onMaterialSelect={handleMaterialSelect}
                    pendingSuggestion={pendingSuggestions[0] || undefined}
                    isSuggester={permission === 'suggester'}
                    elements={design.elements || []}
                    activeElementName={selectedRegions.length > 0
                        ? (design.elements?.find(e => e.id === selectedRegions[selectedRegions.length - 1])?.label || selectedRegions[selectedRegions.length - 1])
                        : undefined}
                />

                <div className="flex-1 relative bg-[#fcfcfc]">
                    <PreviewCanvas
                        baseImageUrl={design.baseMediaUrl || "/demo/coastal/base.jpg"}
                        masksUrlPrefix={design.masksUrlPrefix || "/demo/coastal"}
                        elements={design.elements}
                        selectedMaterials={(design.state.stateJson || {})}
                        presetsMap={presets}
                        highlightedRegion={highlightedRegion}
                        pendingSuggestion={pendingSuggestions[0] || undefined}
                        selectedRegions={selectedRegions}
                        lockedRegions={lockedRegions}
                        suggesterMode={permission === 'suggester'}
                        commentCounts={Object.fromEntries(
                            [...new Set(regionComments.map(c => c.region))].map(r => [r, regionComments.filter(c => c.region === r).length])
                        )}
                        onRegionClick={(region, x, y, shiftKey) => {
                            if (shiftKey) {
                                setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
                            } else {
                                setSelectedRegions([region]);
                            }
                            setChipPosition({ x, y });
                        }}
                        onBackgroundClick={() => {
                            setSelectedRegions([]);
                            setChipPosition(null);
                        }}
                    />
                    {selectedRegions.length > 0 && chipPosition && (
                        <div
                            className="absolute z-30 flex items-center animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out pointer-events-auto"
                            style={{ left: chipPosition.x, top: chipPosition.y - 60, transform: 'translateX(-50%)', position: 'absolute' }}
                        >
                            <div className="rounded-xl p-1.5 flex items-center gap-2 border border-white/10 bg-[#0f0f12]/95 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300">
                                <span className="text-xs font-bold whitespace-nowrap px-3 tracking-widest uppercase text-white">
                                    {selectedRegions.length === 1 ? (() => {
                                        const r = selectedRegions[0];
                                        const el = design.elements?.find(e => e.id === r);
                                        return el ? el.label : r.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    })() : `${selectedRegions.length} Selected`}
                                </span>
                                
                                <div className="w-px h-4 bg-white/10" />

                                {permission === 'editor' && (() => {
                                    const isLocked = selectedRegions.every(r => lockedRegions.some(l => l.region === r));
                                    return (
                                        <button
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ease-out flex items-center gap-1.5 ${
                                                isLocked 
                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                                    : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                            onClick={async () => {
                                                for (const r of selectedRegions) {
                                                    try {
                                                        const res = await api.graphqlRequest<any>(TOGGLE_REGION_LOCK_MUTATION, {
                                                            designId, region: r, designSessionToken: sessionToken, actorName: displayName, participantId: participantIdRef.current
                                                        , workspaceId: workspaceId || undefined});
                                                        if (!res.toggleRegionLock.success) {
                                                            toast({ title: res.toggleRegionLock.errors[0], variant: 'destructive' });
                                                        }
                                                    } catch {
                                                        toast({ title: "Lock request failed", variant: "destructive" });
                                                    }
                                                }
                                                setChipPosition(null);
                                                setSelectedRegions([]);
                                            }}
                                        >
                                            {isLocked ? (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                    Unlock
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                    Lock
                                                </>
                                            )}
                                        </button>
                                    );
                                })()}

                                <button
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white transition-all duration-300 ease-out"
                                    title="Add Comment"
                                    aria-label="Add Comment"
                                    onClick={() => {
                                        setCommentsRegion(selectedRegions[0] || null);
                                        setIsCommentsOpen(true);
                                    }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Visual Scope Summary chip rail ─────────────────────────────── */}
            {scopeChips.length > 0 && (
                <div
                    className="h-10 flex items-center gap-2 px-5 overflow-x-auto shrink-0"
                    style={{ background: '#0a0a0d', borderTop: '1px solid rgba(255,255,255,0.04)', scrollbarWidth: 'none' }}
                >
                    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-600 shrink-0">Applied</span>
                    {scopeChips.slice(0, 6).map(({ region, label, preset }) => (
                        <button
                            key={region}
                            title={`${label} — ${preset!.name}`}
                            onClick={() => {
                                // Replace selection cleanly — does not conflict with shift-multi-select
                                // which only occurs on canvas click (onRegionClick). This is a direct jump.
                                setSelectedRegions([region]);
                                setChipPosition(null); // no chip popup from here
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0 transition-colors"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#e5e7eb',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                            }}
                        >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: preset!.swatchHex }} />
                            {label}
                        </button>
                    ))}
                    {scopeChips.length > 6 && (
                        <span className="text-[9px] text-neutral-600 shrink-0 font-bold">+{scopeChips.length - 6} more</span>
                    )}
                </div>
            )}

            {/* Floating Pending Suggestion Banner — shown to editor when suggestion pending */}
            {permission === 'editor' && pendingSuggestions.length > 0 && (() => {
                const s = pendingSuggestions[0];
                return (
                    <div
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500"
                        style={{
                            background: 'rgba(15,15,20,0.92)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(251,191,36,0.35)',
                            boxShadow: '0 0 0 1px rgba(251,191,36,0.15), 0 20px 60px rgba(0,0,0,0.4)',
                            minWidth: 360
                        }}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)] shrink-0" />
                        <div
                            className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
                            style={{
                                backgroundColor: s.preset.swatchHex,
                                backgroundImage: s.preset.thumbnailUrl ? `url(${s.preset.thumbnailUrl})` : 'none',
                                backgroundSize: 'cover'
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">{s.actorName} suggested</p>
                            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate">{s.preset.name} · {s.region}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => handleRejectSuggestion(s.eventId)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-neutral-400 border border-white/10 hover:bg-white/5 transition-all active:scale-95"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleApproveSuggestion(s.eventId)}
                                className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg transition-all active:scale-95"
                            >
                                ✓ Approve
                            </button>
                        </div>
                        <button
                            onClick={() => { setIsLedgerOpen(true); }}
                            className="text-[9px] font-bold text-neutral-500 hover:text-neutral-300 uppercase tracking-wider shrink-0 pl-2 border-l border-white/10 transition-all"
                        >
                            View History
                        </button>
                    </div>
                );
            })()}

            {/* Project Readiness Panel */}
            <ProjectReadinessPanel
                stateJson={design.state.stateJson ?? {}}
                versions={design.versions ?? []}
                pendingSuggestions={pendingSuggestions}
                finalVersionId={design.finalVersionId ? String(design.finalVersionId) : null}
                presetsMap={presets}
                exportDone={exportDone}
                onOpenTakeoff={() => setIsTakeoffOpen(true)}
                onOpenExport={() => setIsExportOpen(true)}
                isEditor={permission === 'editor'}
            />

            {/* Bottom Bar */}
            <BottomBar
                mode="design"
                onModeChange={() => { }}
                onOpenLedger={() => setIsLedgerOpen(true)}
                onOpenVersions={() => setIsOptionsOpen(true)}
                onOpenTakeoff={() => setIsTakeoffOpen(true)}
                onShare={() => setIsShareOpen(true)}
                onUndo={handleUndo}
                canUndo={permission === 'editor' && !!design.recentEvents?.find(e => e.eventType === 'apply_material')}
                statusText={lastSavedText}
                pendingSuggestionCount={permission === 'editor' ? pendingSuggestions.length : 0}
            />

            {/* Drawers */}
            <DesignLedgerDrawer
                open={isLedgerOpen}
                onOpenChange={setIsLedgerOpen}
                events={design.recentEvents || []}
                presetsMap={presets}
                onRevertEvent={handleRevertEvent}
                onEventHover={(r) => setHighlightedRegion(r as DesignRegion | undefined)}
                isEditor={permission === 'editor'}
                currentState={(design.state.stateJson || {}) as Record<DesignRegion, string>}
                statusChip={statusChip}
                pendingSuggestion={pendingSuggestions[0] || undefined}
                onApproveSuggestion={handleApproveSuggestion}
                onRejectSuggestion={handleRejectSuggestion}
                regionComments={regionComments}
                elements={design.elements || []}
            />

            <OptionsDrawer
                open={isOptionsOpen}
                onOpenChange={setIsOptionsOpen}
                versions={design.versions || []}
                currentState={design.state.stateJson || {}}
                finalVersionId={design.finalVersionId ? String(design.finalVersionId) : null}
                presetsMap={presets}
                onSaveVersion={handleSaveVersion}
                onCompare={setCompareOption}
                onRestore={handleRestoreVersion}
                onMarkFinal={handleMarkFinal}
                onUnlockDesign={handleUnlockDesign}
                isEditor={permission === 'editor'}
            />

            {compareOption && (
                <OptionCompare
                    version={compareOption}
                    currentState={(design.state.stateJson || {}) as Record<DesignRegion, string>}
                    presetsMap={presets}
                    baseImageUrl={design.baseMediaUrl || "/demo/coastal/base.jpg"}
                    masksUrlPrefix={design.masksUrlPrefix || "/demo/coastal"}
                    elements={design.elements || []}
                    onClose={() => setCompareOption(null)}
                    onRestore={handleRestoreVersion}
                    onSaveCurrentAsOption={async (label) => {
                        await handleSaveVersion(label);
                        setCompareOption(null);
                    }}
                    onMarkFinal={async (versionId) => {
                        await handleMarkFinal(versionId);
                        setCompareOption(null);
                    }}
                    onSendForReview={() => {
                        setCompareOption(null);
                        setIsShareOpen(true);
                    }}
                    isEditor={permission === 'editor'}
                />
            )}

            <ShareDialog
                open={isShareOpen}
                onOpenChange={(v) => { setIsShareOpen(v); if (!v) setShareLinkUrl(null); }}
                shareLink={shareLinkUrl}
                isLoading={shareLinkLoading}
                onCreateLink={handleCreateShareLink}
                activeLinks={shareLinks}
                onRevokeLink={handleRevokeShareLink}
            />

            <TakeoffDrawer
                open={isTakeoffOpen}
                onOpenChange={setIsTakeoffOpen}
                currentState={(design.state.stateJson || {}) as Record<string, string>}
                presetsMap={presets}
                designTitle={design.title}
                versions={design.versions || []}
                statusChip={statusChip}
                lockedRegions={lockedRegions.map(l => l.region)}
                regionComments={regionComments}
                elements={design.elements || []}
                onExport={() => { setExportDone(true); handleRecordExport('proposal'); }}
            />

            <ExportDialog
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                onExport={handleRecordExport}
                designTitle={design.title}
                currentState={(design.state.stateJson || {}) as Record<string, string>}
                presetsMap={presets}
                versions={design.versions || []}
                statusChip={statusChip}
                lockedRegions={lockedRegions.map(l => l.region)}
                regionComments={regionComments}
                elements={design.elements || []}
            />

            <ConflictBanner
                show={!!conflictMsg}
                message={conflictMsg || ''}
                conflictRegion={conflictRegion || undefined}
                errorCode={conflictErrorCode || undefined}
                myMaterial={conflictMaterial || undefined}
                theirMaterial={conflictTheirMaterial || undefined}
                onKeepTheirs={() => {
                    setConflictMsg(null);
                    setConflictTheirMaterial(null);
                    setConflictErrorCode(null);
                    refreshDesignData();
                }}
                onKeepMine={() => {
                    setConflictMsg(null);
                    setConflictTheirMaterial(null);
                    setConflictErrorCode(null);
                    if (conflictMaterial && conflictRegion && conflictErrorCode !== 'LOCKED' && conflictErrorCode !== 'CONFLICT') {
                        handleMaterialSelect([conflictRegion], conflictMaterial);
                    }
                }}
            />

            <RegionCommentsDrawer
                open={isCommentsOpen}
                onOpenChange={setIsCommentsOpen}
                region={commentsRegion}
                regionLabel={commentsRegion ? (design.elements?.find(e => e.id === commentsRegion)?.label || commentsRegion.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : undefined}
                comments={regionComments}
                onAddComment={handleAddComment}
                onResolveComment={handleResolveComment}
                currentUserName={displayName}
                currentUserRole={role as 'contractor' | 'homeowner'}
                currentPermission={permission}
            />

            <ProjectChatDrawer
                open={isProjectChatOpen}
                onOpenChange={setIsProjectChatOpen}
                messages={projectMessages}
                onAddMessage={handleAddProjectMessage}
                currentUserName={displayName}
                currentUserRole={role as 'contractor' | 'homeowner'}
                currentPermission={permission}
            />

            {/* Success Celebration Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-xl animate-in fade-in duration-700">
                    <div className="relative flex flex-col items-center animate-in zoom-in slide-in-from-bottom-12 duration-1000 ease-out">
                        {/* Burst Animation Background */}
                        <div className="absolute inset-0 -z-10 bg-emerald-400/20 blur-[100px] rounded-full scale-150 animate-pulse" />

                        <div className="w-24 h-24 rounded-3xl bg-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-2 border-white/40 flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeDasharray="50" strokeDashoffset="50" className="animate-[draw_1s_ease-out_forwards]" />
                            </svg>
                        </div>

                        <h2 className="text-4xl font-black text-neutral-900 tracking-tighter uppercase mb-2">Design Finalized</h2>
                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Proposal generation ready</p>
                    </div>

                    <style jsx>{`
                        @keyframes draw {
                            to { stroke-dashoffset: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* Debug overlay — only visible with ?debug=1 or NEXT_PUBLIC_SHOW_DEBUG=true */}
            {useDebugMode() && (
                <DebugOverlay sessionToken={sessionToken} permission={permission} pid={participantIdRef.current} socketActive={socketActive} />
            )}
        </EditorShell>
    );
}
