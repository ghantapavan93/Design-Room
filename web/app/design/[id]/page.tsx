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
import { ShareDialog } from '@/components/design/share_dialog';
import { ConflictBanner } from '@/components/design/conflict_banner';
import { DesignRegion } from '@/lib/regions';
import { api } from '@/api/client';
import {
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
    MARK_FINAL_MUTATION,
    JOIN_SESSION_MUTATION
} from '@/api/queries';
import { Design, MaterialPreset, DesignEvent, SessionMember, DesignVersion } from '@/lib/types';
import { generateIdempotencyKey } from '@/lib/idempotency';
import { toast } from '@/components/ui/toast';
import { formatTimeAgo } from '@/lib/time';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_CABLE_URL || 'ws://localhost:3000/cable';
const RECONNECT_DELAY_MS = 2500;
const HEARTBEAT_INTERVAL_MS = 10000;

export default function DesignEditorPage() {
    const params = useParams();
    const designId = params.id as string;

    // Session State
    const [sessionToken, setSessionToken] = React.useState<string | null>(null);
    const [role, setRole] = React.useState<'contractor' | 'homeowner'>('contractor');
    const [permission, setPermission] = React.useState<'editor' | 'suggester' | 'viewer'>('editor');
    const [displayName, setDisplayName] = React.useState('Alex Contractor');

    // App State
    const [design, setDesign] = React.useState<Design | null>(null);
    const [presets, setPresets] = React.useState<Record<string, MaterialPreset>>({});
    const [presetsArr, setPresetsArr] = React.useState<MaterialPreset[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [connected, setConnected] = React.useState(false);
    const [members, setMembers] = React.useState<SessionMember[]>([]);

    // UI State
    const [selectedRegions, setSelectedRegions] = React.useState<DesignRegion[]>(['walls']);
    const [chipPosition, setChipPosition] = React.useState<{ x: number, y: number } | null>(null);
    const [highlightedRegion, setHighlightedRegion] = React.useState<DesignRegion | undefined>();
    const [isLedgerOpen, setIsLedgerOpen] = React.useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
    const [isTakeoffOpen, setIsTakeoffOpen] = React.useState(false);
    const [isShareOpen, setIsShareOpen] = React.useState(false);

    // Pending Suggestion State
    const [pendingSuggestion, setPendingSuggestion] = React.useState<{ region: DesignRegion; preset: MaterialPreset; actorName: string; eventId: string } | null>(null);

    // Compare/Option State
    const [compareOption, setCompareOption] = React.useState<DesignVersion | null>(null);

    // Share State
    const [shareLinkLoading, setShareLinkLoading] = React.useState(false);
    const [shareLinkUrl, setShareLinkUrl] = React.useState<string | null>(null);

    // Conflict State
    const [conflictMsg, setConflictMsg] = React.useState<string | null>(null);
    const [conflictMaterial, setConflictMaterial] = React.useState<MaterialPreset | null>(null);
    const [conflictRegion, setConflictRegion] = React.useState<DesignRegion | null>(null);

    // Refs for websocket
    const socketRef = React.useRef<WebSocket | null>(null);
    const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const heartbeatRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldStopRef = React.useRef(false);
    const subscribedRef = React.useRef(false);

    // Initialize Session from sessionStorage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = sessionStorage.getItem('designSessionToken');
            const storedRole = sessionStorage.getItem('sessionRole') as 'contractor' | 'homeowner';
            const storedPermission = sessionStorage.getItem('sessionPermission') as 'editor' | 'suggester' | 'viewer';

            if (storedToken) {
                setSessionToken(storedToken);
                setRole(storedRole || 'homeowner');
                setPermission(storedPermission || 'suggester');
                setDisplayName(storedRole === 'homeowner' ? 'Sam Homeowner' : 'Alex Contractor');
            }
        }
    }, []);

    // Fetch Initial Data
    React.useEffect(() => {
        async function load() {
            try {
                const [designRes, matRes] = await Promise.all([
                    api.graphqlRequest<any>(DESIGN_QUERY, { id: designId }),
                    api.graphqlRequest<any>(MATERIALS_QUERY)
                ]);

                const map: Record<string, MaterialPreset> = {};
                const arr: MaterialPreset[] = [];
                matRes.materials.forEach((m: MaterialPreset) => {
                    map[m.id] = m;
                    arr.push(m);
                });

                setPresets(map);
                setPresetsArr(arr);
                setDesign(designRes.design);

                // Check for pending suggestion
                const events = designRes.design.recentEvents;
                if (events && events.length > 0) {
                    const lastSuggestion = events.find((e: DesignEvent) => e.eventType === 'suggest_material');
                    if (lastSuggestion && map[lastSuggestion.toMaterialId!]) {
                        setPendingSuggestion({
                            region: lastSuggestion.region as DesignRegion,
                            preset: map[lastSuggestion.toMaterialId!],
                            actorName: lastSuggestion.actorName,
                            eventId: lastSuggestion.id
                        });
                    }
                }
            } catch (e) {
                console.error(e);
                toast({ title: "Failed to load design", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [designId]);

    // Join Design Session Handshake
    React.useEffect(() => {
        if (!designId || loading) return;
        if (sessionToken) return; // Only join if no active token

        async function join() {
            try {
                const res = await api.graphqlRequest<any>(JOIN_SESSION_MUTATION, {
                    input: { designId, displayName, role, permission }
                });

                const payload = res.joinDesignSession;
                if (!payload.success || !payload.designSessionToken) {
                    toast({ title: payload.errors?.[0] || "Failed to start live session", variant: "destructive" });
                    return;
                }

                const token = payload.designSessionToken as string;
                sessionStorage.setItem("designSessionToken", token);
                sessionStorage.setItem("sessionRole", role);
                sessionStorage.setItem("sessionPermission", permission);

                setSessionToken(token);

                if (payload.members) setMembers(payload.members);
            } catch (e) {
                toast({ title: "Failed to start live session", variant: "destructive" });
            }
        }

        join();
    }, [designId, loading, sessionToken, displayName, role, permission]);

    // Websocket
    React.useEffect(() => {
        if (!designId || loading || !sessionToken) return;

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
        };

        const connectWs = () => {
            if (shouldStopRef.current) return;

            subscribedRef.current = false;
            setConnected(false);

            const tokenParam = sessionToken ? `?token=${encodeURIComponent(sessionToken)}` : "";
            const wsUrl = `${WEBSOCKET_URL}${tokenParam}`;

            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                const identifier = JSON.stringify({ channel: "DesignRoomChannel", design_id: designId });
                ws.send(JSON.stringify({ command: "subscribe", identifier }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "ping") return;

                    if (data.type === "confirm_subscription") {
                        subscribedRef.current = true;
                        setConnected(true);

                        // stop polling once subscription is confirmed
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
                        return;
                    }

                    if (data.message?.members) {
                        setMembers(data.message.members);
                        return;
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

                // start polling quickly so UI stays fresh during reconnect
                startPolling();

                cleanupTimers();
                reconnectRef.current = setTimeout(() => {
                    connectWs();
                }, RECONNECT_DELAY_MS);
            };
        };

        connectWs();

        heartbeatRef.current = setInterval(() => {
            if (!sessionToken || !displayName) return;

            api.graphqlRequest(
                `mutation Heartbeat($input: HeartbeatInput!) { heartbeat(input: $input) { success members errors } }`,
                { input: { designSessionToken: sessionToken, displayName, role, permission } }
            ).then((r: any) => {
                const payload = r.heartbeat;
                if (payload?.members) setMembers(payload.members);
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
    }, [designId, loading, sessionToken, displayName, role, permission]);

    const startPolling = () => {
        if (pollRef.current) return;
        pollRef.current = setInterval(async () => {
            try {
                const res = await api.graphqlRequest<any>(DESIGN_QUERY, { id: designId });
                if (res.design) setDesign(res.design);
            } catch { }
        }, 2500);
    };

    const handleIncomingEvent = (ev: DesignEvent, newState: any, newVersion?: DesignVersion) => {
        if (ev.eventType === 'suggest_material') {
            const preset = presets[ev.toMaterialId!];
            if (preset) {
                setPendingSuggestion({ region: ev.region as DesignRegion, preset, actorName: ev.actorName, eventId: ev.id });
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
            if (ev.eventType === 'approve_suggestion' || ev.eventType === 'reject_suggestion') setPendingSuggestion(null);
            setDesign(prev => {
                if (!prev) return prev;
                const newVersions = newVersion ? [newVersion, ...prev.versions] : prev.versions;
                const exists = prev.recentEvents.find(e => e.id === ev.id);
                const eventsList = exists ? prev.recentEvents : [ev, ...prev.recentEvents];
                return { ...prev, state: newState || prev.state, versions: newVersions, recentEvents: eventsList };
            });
        }
    };

    // ----- Actions -----
    const refreshDesignData = async () => {
        try { const res = await api.graphqlRequest<any>(DESIGN_QUERY, { id: designId }); setDesign(res.design); } catch { }
    };

    const handleMaterialSelect = async (regions: DesignRegion[], preset: MaterialPreset) => {
        if (permission === 'viewer') return;
        const txnId = generateIdempotencyKey();

        const newStateJson = { ...design?.state?.stateJson };
        regions.forEach(r => newStateJson[r] = preset.id);

        if (permission === 'editor') {
            // Optimistic
            setDesign(prev => prev ? { ...prev, state: { ...prev.state, stateJson: newStateJson as any } } : null);
            try {
                await Promise.all(regions.map(async r => {
                    const res = await api.graphqlRequest<any>(APPLY_MATERIAL_MUTATION, {
                        input: { designId, region: r, materialId: preset.id, actorName: displayName, actorRole: role, actorPermission: permission, clientTxnId: txnId, designSessionToken: sessionToken }
                    });
                    if (!res.applyMaterial.success) {
                        if (res.applyMaterial.errorCode === 'CONFLICT') {
                            setConflictMsg(res.applyMaterial.errors[0]);
                            setConflictMaterial(preset);
                            setConflictRegion(r);
                        } else {
                            toast({ title: res.applyMaterial.errors[0], variant: 'destructive' });
                        }
                    }
                }));
                refreshDesignData();
            } catch { toast({ title: 'Network error', variant: 'destructive' }); refreshDesignData(); }
        } else if (permission === 'suggester') {
            try {
                await Promise.all(regions.map(async r => {
                    const res = await api.graphqlRequest<any>(SUGGEST_MATERIAL_MUTATION, {
                        input: { designId, region: r, materialId: preset.id, actorName: displayName, actorRole: role, actorPermission: permission, clientTxnId: txnId, designSessionToken: sessionToken }
                    });
                    if (res.suggestMaterial.success) {
                        setPendingSuggestion({ region: r, preset, actorName: displayName, eventId: res.suggestMaterial.event.id });
                    } else {
                        toast({ title: res.suggestMaterial.errors[0], variant: 'destructive' });
                    }
                }));
                toast({ title: 'Suggestions sent to contractor', variant: 'success' });
            } catch { toast({ title: 'Network error', variant: 'destructive' }); }
        }
    };

    const handleApproveSuggestion = async () => {
        if (!pendingSuggestion || permission !== 'editor') return;
        try {
            const res = await api.graphqlRequest<any>(APPROVE_SUGGESTION_MUTATION, {
                input: { eventId: pendingSuggestion.eventId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken }
            });
            if (!res.approveSuggestion.success) toast({ title: res.approveSuggestion.errors[0], variant: 'destructive' });
        } catch { toast({ title: 'Failed to approve', variant: 'destructive' }); }
    };

    const handleRejectSuggestion = async () => {
        if (!pendingSuggestion || permission !== 'editor') return;
        try {
            const res = await api.graphqlRequest<any>(REJECT_SUGGESTION_MUTATION, {
                input: { eventId: pendingSuggestion.eventId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken }
            });
            if (res.rejectSuggestion.success) setPendingSuggestion(null);
        } catch { toast({ title: 'Failed to reject', variant: 'destructive' }); }
    };

    const handleSaveVersion = async (label: string) => {
        try {
            await api.graphqlRequest<any>(SAVE_VERSION_MUTATION, {
                input: { designId, label, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken }
            });
            toast({ title: `Saved version: ${label}`, variant: 'success' });
            refreshDesignData();
        } catch { toast({ title: 'Failed to save version', variant: 'destructive' }); }
    };

    const handleRestoreVersion = async (versionId: string) => {
        try {
            await api.graphqlRequest<any>(RESTORE_VERSION_MUTATION, {
                input: { versionId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken }
            });
            toast({ title: 'Design restored', variant: 'success' });
            setCompareOption(null);
            setIsOptionsOpen(false);
            refreshDesignData();
        } catch { toast({ title: 'Failed to restore', variant: 'destructive' }); }
    };

    const handleMarkFinal = async (versionId: string) => {
        try {
            const res = await api.graphqlRequest<any>(MARK_FINAL_MUTATION, {
                input: { versionId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken }
            });
            if (res.markFinalVersion.success) {
                toast({ title: 'Version marked as final', variant: 'success' });
                refreshDesignData();
            } else {
                toast({ title: res.markFinalVersion.errors[0], variant: 'destructive' });
            }
        } catch { toast({ title: 'Failed to mark final', variant: 'destructive' }); }
    };

    const handleRevertEvent = async (eventId: string) => {
        try {
            const res = await api.graphqlRequest<any>(REVERT_EVENT_MUTATION, {
                input: { eventId, actorName: displayName, clientTxnId: generateIdempotencyKey(), designSessionToken: sessionToken }
            });
            if (res.revertEvent.success) { toast({ title: 'Action reverted', variant: 'success' }); refreshDesignData(); }
            else toast({ title: res.revertEvent.errors[0], variant: 'destructive' });
        } catch { toast({ title: 'Failed to revert', variant: 'destructive' }); }
    };

    const handleCreateShareLink = async (mode: 'live' | 'view', targetPermission: 'suggester' | 'viewer') => {
        setShareLinkLoading(true);
        try {
            const res = await api.graphqlRequest<any>(CREATE_LINK_MUTATION, {
                input: { designId, mode, permission: mode === 'live' ? targetPermission : undefined }
            });
            if (res.createShareLink.success) {
                const token = res.createShareLink.link.token;
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                setShareLinkUrl(`${origin}/design/${mode}/${token}`);
            }
        } catch { toast({ title: 'Failed to create link', variant: 'destructive' }); }
        finally { setShareLinkLoading(false); }
    };

    const handleUndo = () => {
        const lastApply = design?.recentEvents?.find(e => e.eventType === 'apply_material');
        if (lastApply) handleRevertEvent(lastApply.id);
    };

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

    let statusChip = 'Draft';
    if (design.versions && design.versions.length > 0) statusChip = 'In Review';
    if (design.finalVersionId) statusChip = 'Approved';
    const lastSavedText = design.state.lastSavedAt ? `Saved ${formatTimeAgo(design.state.lastSavedAt)}` : 'Unsaved';

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
                        className="pill text-xs"
                        style={{
                            background: statusChip === 'Approved' ? 'rgba(34,197,94,0.12)' : statusChip === 'In Review' ? 'rgba(245,158,11,0.12)' : 'var(--bg-active)',
                            color: statusChip === 'Approved' ? '#4ade80' : statusChip === 'In Review' ? '#fbbf24' : 'var(--text-muted)',
                        }}
                    >
                        {statusChip}
                    </span>
                </div>

                {pendingSuggestion && permission === 'editor' && (
                    <div
                        className="flex items-center gap-3 px-3.5 py-1.5 rounded-full animate-fade-up"
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                        <span className="text-xs font-medium" style={{ color: '#93c5fd' }}>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{pendingSuggestion.actorName}</span> suggested — <span className="capitalize">{pendingSuggestion.region}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handleRejectSuggestion}
                                className="px-3 py-1 text-xs font-medium rounded-full transition-all"
                                style={{ border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', background: 'transparent' }}
                                onMouseOver={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.12)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                            >Reject</button>
                            <button
                                onClick={handleApproveSuggestion}
                                className="px-3 py-1 text-xs font-medium rounded-full transition-all"
                                style={{ background: '#3b82f6', color: 'white' }}
                                onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
                                onMouseOut={e => (e.currentTarget.style.background = '#3b82f6')}
                            >Approve</button>
                        </div>
                    </div>
                )}

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

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                <MaterialPanel
                    presets={presetsArr}
                    selectedRegions={selectedRegions}
                    onRegionChange={setSelectedRegions}
                    selectedMaterials={(design.state.stateJson || {}) as Record<DesignRegion, string>}
                    onMaterialSelect={handleMaterialSelect}
                    pendingSuggestion={pendingSuggestion || undefined}
                    isSuggester={permission === 'suggester'}
                />

                <div className="flex-1 relative">
                    <LivePresenceBar members={members} isConnected={connected} />
                    <PreviewCanvas
                        baseImageUrl="/demo/exterior_base.jpg"
                        masksUrlPrefix="/demo"
                        selectedMaterials={(design.state.stateJson || {}) as Record<DesignRegion, string>}
                        presetsMap={presets}
                        highlightedRegion={highlightedRegion}
                        pendingSuggestion={pendingSuggestion || undefined}
                        selectedRegions={selectedRegions}
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
                            className="absolute z-30 flex flex-col items-center animate-fade-up pointer-events-auto"
                            style={{ left: chipPosition.x, top: chipPosition.y - 60, transform: 'translateX(-50%)', position: 'fixed' }}
                        >
                            <div className="glass rounded-xl shadow-2xl p-2 flex items-center gap-3 border border-white/20">
                                <span className="text-xs font-bold text-white whitespace-nowrap px-1">{selectedRegions.length === 1 ? selectedRegions[0].toUpperCase() : `${selectedRegions.length} REGIONS`} SELECTED</span>
                                <div className="w-px h-4 bg-white/20" />
                                <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white transition-colors" onClick={() => { /* Apply logic if they want to click it over picking from menu */ }}>Apply</button>
                                {permission === 'editor' && <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors" onClick={() => { setChipPosition(null); }}>Lock</button>}
                            </div>
                            <div className="w-3 h-3 bg-white/10 border-r border-b border-white/20 rotate-45 -mt-1.5 backdrop-blur-md" />
                        </div>
                    )}
                </div>
            </div>

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
                pendingSuggestion={pendingSuggestion || undefined}
            />

            <OptionsDrawer
                open={isOptionsOpen}
                onOpenChange={setIsOptionsOpen}
                versions={design.versions || []}
                currentState={design.state.stateJson || {}}
                finalVersionId={design.finalVersionId ? String(design.finalVersionId) : null}
                onSaveVersion={handleSaveVersion}
                onCompare={setCompareOption}
                onRestore={handleRestoreVersion}
                onMarkFinal={handleMarkFinal}
                isEditor={permission === 'editor'}
            />

            {compareOption && (
                <OptionCompare
                    version={compareOption}
                    currentState={(design.state.stateJson || {}) as Record<DesignRegion, string>}
                    presetsMap={presets}
                    baseImageUrl="/demo/exterior_base.jpg"
                    masksUrlPrefix="/demo"
                    onClose={() => setCompareOption(null)}
                    onRestore={handleRestoreVersion}
                    isEditor={permission === 'editor'}
                />
            )}

            <ShareDialog
                open={isShareOpen}
                onOpenChange={(v) => { setIsShareOpen(v); if (!v) setShareLinkUrl(null); }}
                shareLink={shareLinkUrl}
                isLoading={shareLinkLoading}
                onCreateLink={handleCreateShareLink}
            />

            <TakeoffDrawer
                open={isTakeoffOpen}
                onOpenChange={setIsTakeoffOpen}
                currentState={(design.state.stateJson || {}) as Record<string, string>}
                presetsMap={presets}
            />

            <ConflictBanner
                show={!!conflictMsg}
                message={conflictMsg || ''}
                onKeepTheirs={() => { setConflictMsg(null); refreshDesignData(); }}
                onKeepMine={() => { setConflictMsg(null); if (conflictMaterial && conflictRegion) handleMaterialSelect([conflictRegion], conflictMaterial); }}
            />
        </EditorShell>
    );
}
