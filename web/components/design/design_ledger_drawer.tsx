import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { DesignEvent, MaterialPreset } from '../../lib/types';
import { formatTimeAgo } from '../../lib/time';

interface DesignLedgerDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    events: DesignEvent[];
    presetsMap: Record<string, MaterialPreset>;
    onRevertEvent: (eventId: string) => void;
    onEventHover: (region: string | undefined) => void;
    isEditor: boolean;
    currentState?: Record<string, string>;
    statusChip?: string;
    pendingSuggestion?: { region: string, preset: MaterialPreset, eventId: string, actorName: string } | null;
    onApproveSuggestion: (eventId: string) => void;
    onRejectSuggestion: (eventId: string) => void;
    regionComments?: { region: string, body: string, authorName: string }[];
    elements?: any[];
}

export function DesignLedgerDrawer({
    open,
    onOpenChange,
    events,
    presetsMap,
    onRevertEvent,
    onEventHover,
    isEditor,
    currentState = {},
    statusChip = 'Draft',
    pendingSuggestion,
    onApproveSuggestion,
    onRejectSuggestion,
    regionComments = [],
    elements = []
}: DesignLedgerDrawerProps) {
    // Auto-switch to Decision Summary tab when a pending suggestion arrives
    const [tab, setTab] = React.useState<'activity' | 'summary'>('activity');
    const prevSuggestion = React.useRef(pendingSuggestion);

    React.useEffect(() => {
        // Jump to summary tab when a NEW suggestion arrives
        if (pendingSuggestion && pendingSuggestion !== prevSuggestion.current) {
            setTab('summary');
        }
        prevSuggestion.current = pendingSuggestion;
    }, [pendingSuggestion]);

    // Also jump to summary when drawer opens and there's already a pending suggestion
    React.useEffect(() => {
        if (open && pendingSuggestion) {
            setTab('summary');
        }
    }, [open]);

    const getActionText = (event: DesignEvent) => {
        switch (event.eventType) {
            case 'apply_material': return event.toMaterialId ? 'changed' : 'cleared';
            case 'suggest_material': return event.toMaterialId ? 'suggested' : 'suggested clearing';
            case 'approve_suggestion': return 'approved';
            case 'reject_suggestion': return 'rejected';
            case 'save_version': return 'saved version';
            case 'restore_version': return 'restored version';
            case 'revert_event': return 'reverted';
            default: return 'updated';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'suggest_material': return (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
            );
            case 'approve_suggestion': return (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
            case 'reject_suggestion': return (
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            );
            case 'save_version': return (
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
            );
            case 'apply_material': return (
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                </div>
            );
            default: return (
                <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                </div>
            );
        }
    };

    const getRegionLabel = (regionKey: string) => {
        if (!regionKey) return '';
        // If it's a numeric ID or matches an element ID, find it
        const el = elements.find(e => String(e.id) === String(regionKey) || e.label === regionKey);
        if (el) return el.label;
        // Otherwise format the raw string (e.g. "wall_left" -> "Wall Left")
        return regionKey.replace(/_/g, ' ');
    };

    const hasPending = !!pendingSuggestion;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Property Ledger">
            <p className="text-[10px] font-medium px-5 -mt-1 mb-2 opacity-50 tracking-wide" style={{ color: 'var(--text-muted)' }}>Tracks material changes, suggestions & version activity</p>

            {/* Tab bar — badge on Decision Summary when pending */}
            <div className="flex border-b border-white/10 mb-6 mx-5 mt-4 bg-white/5 rounded-xl p-1 relative z-10">
                <button
                    onClick={() => setTab('activity')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-lg ${tab === 'activity' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setTab('summary')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-lg flex items-center justify-center gap-1.5 ${tab === 'summary' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    Decision Summary
                    {hasPending && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    )}
                </button>
            </div>

            <div className="px-5 pb-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* ── ACTIVITY LOG ── */}
                {tab === 'activity' && (
                    <div className="relative border-l border-white/10 ml-3 pb-8 space-y-8">
                        {hasPending && isEditor && (
                            <div className="relative pl-8 mb-2">
                                <div className="absolute -left-4 top-0 rounded-full bg-zinc-950 ring-4 ring-zinc-950 shadow-lg">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    </div>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">⚡ Pending Review</span>
                                        <span className="text-[9px] text-neutral-500 font-bold uppercase">from {pendingSuggestion!.actorName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/10">
                                        <div className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
                                            style={{ backgroundColor: pendingSuggestion!.preset.swatchHex, backgroundImage: pendingSuggestion!.preset.thumbnailUrl ? `url(${pendingSuggestion!.preset.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight">{pendingSuggestion!.preset.name}</p>
                                            <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{getRegionLabel(pendingSuggestion!.region)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onRejectSuggestion(pendingSuggestion!.eventId)}
                                            className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-300 border border-white/10 hover:bg-white/5 transition-all"
                                        >Reject</button>
                                        <button
                                            onClick={() => onApproveSuggestion(pendingSuggestion!.eventId)}
                                            className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg transition-all"
                                        >✓ Approve</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {events.length === 0 && (
                            <p className="text-xs text-neutral-500 pl-8 italic">No history yet. Start designing!</p>
                        )}

                        {events.map((event, idx) => {
                            const toMaterial = event.toMaterialId ? presetsMap[event.toMaterialId] : null;
                            const fromMaterial = event.fromMaterialId ? presetsMap[event.fromMaterialId] : null;
                            const isSuggestion = event.eventType === 'suggest_material';

                            return (
                                <div
                                    key={event.id}
                                    className="relative pl-8 group animate-in fade-in slide-in-from-left-2 duration-300"
                                    onMouseEnter={() => onEventHover(event.region)}
                                    onMouseLeave={() => onEventHover(undefined)}
                                >
                                    <div className="absolute -left-4 top-0 rounded-full bg-zinc-950 ring-4 ring-zinc-950 shadow-lg">
                                        {getEventIcon(event.eventType)}
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-baseline justify-between w-full">
                                            <div className="text-[11px] text-white leading-relaxed truncate pr-2">
                                                <span className="font-black uppercase tracking-tight">{event.actorName}</span>{' '}
                                                <span className={`font-medium ${isSuggestion ? 'text-amber-400' : 'text-neutral-400'}`}>{getActionText(event)}</span>{' '}
                                                {event.region && <span className="font-black uppercase tracking-tighter text-blue-400">{getRegionLabel(event.region)}</span>}
                                            </div>
                                            <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest shrink-0">
                                                {formatTimeAgo(event.createdAt)}
                                            </span>
                                        </div>

                                        {toMaterial && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mt-1 flex items-center gap-3 transition-all hover:bg-white/10 hover:scale-[1.02] w-full">
                                                <div className="w-8 h-8 rounded-xl border border-white/10 shadow-inner shrink-0"
                                                    style={{ backgroundColor: toMaterial.swatchHex, backgroundImage: toMaterial.thumbnailUrl ? `url(${toMaterial.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] font-black uppercase tracking-tight text-white block truncate">{toMaterial.name}</span>
                                                    {fromMaterial && (
                                                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mt-0.5">was {fromMaterial.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {!toMaterial && (event.eventType === 'apply_material' || event.eventType === 'suggest_material') && fromMaterial && (
                                            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-3 mt-1 flex items-center gap-3 transition-all hover:bg-white/10 w-full opacity-70">
                                                <div className="w-8 h-8 rounded-xl border border-white/10 shadow-inner shrink-0 bg-transparent flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] font-black uppercase tracking-tight text-neutral-400 block truncate">Restored to Original</span>
                                                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mt-0.5">removed {fromMaterial.name}</span>
                                                </div>
                                            </div>
                                        )}

                                        {isEditor && event.eventType === 'apply_material' && idx === 0 && (
                                            <button
                                                onClick={() => onRevertEvent(event.id)}
                                                className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 self-start mt-2 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                Revert Change
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── DECISION SUMMARY ── */}
                {tab === 'summary' && (
                    <div className="px-1 flex flex-col gap-6 pb-12">

                        {/* Pending Suggestion — hero card */}
                        {pendingSuggestion ? (
                            <div>
                                <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3 ml-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                                    Pending Review
                                </h3>
                                <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-5 relative overflow-hidden group flex flex-col gap-4">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full transition-all group-hover:scale-150 pointer-events-none" />

                                    <div className="flex items-center gap-3 z-10">
                                        <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                        <span className="font-black text-white text-[12px] uppercase tracking-widest">{getRegionLabel(pendingSuggestion.region)} — New Suggestion</span>
                                        <span className="text-[10px] text-neutral-400 font-bold ml-auto shrink-0">from {pendingSuggestion.actorName}</span>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 z-10 w-full">
                                        <div className="w-12 h-12 rounded-xl border border-white/10 shadow-inner shrink-0"
                                            style={{ backgroundColor: pendingSuggestion.preset.swatchHex, backgroundImage: pendingSuggestion.preset.thumbnailUrl ? `url(${pendingSuggestion.preset.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-black text-white uppercase tracking-tight block">{pendingSuggestion.preset.name}</span>
                                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">{pendingSuggestion.preset.brand}</span>
                                        </div>
                                    </div>

                                    {isEditor && (
                                        <div className="flex items-center gap-3 z-10 w-full">
                                            <button
                                                onClick={() => onRejectSuggestion(pendingSuggestion.eventId)}
                                                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-400 border border-white/10 hover:bg-white/5 transition-all active:scale-95 text-center"
                                            >
                                                ✕ Reject
                                            </button>
                                            <button
                                                onClick={() => onApproveSuggestion(pendingSuggestion.eventId)}
                                                className="flex-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white shadow-xl bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-95 text-center"
                                                style={{ flex: 2 }}
                                            >
                                                ✓ Approve
                                            </button>
                                        </div>
                                    )}
                                    {!isEditor && (
                                        <p className="text-[10px] text-neutral-500 italic text-center z-10">Waiting for contractor to review...</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/3">
                                <svg className="w-6 h-6 text-neutral-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No pending suggestions</p>
                            </div>
                        )}

                        {/* Project Status */}
                        <div>
                            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">Project Status</h3>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-xs font-bold text-neutral-300 uppercase tracking-tight">Current Phase</span>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">{statusChip}</span>
                            </div>
                        </div>

                        {/* Approved Changes */}
                        <div>
                            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">Approved Materials</h3>
                            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
                                {Object.keys(currentState).length === 0 ? (
                                    <div className="p-6 text-center text-xs text-neutral-500 italic uppercase tracking-widest">No materials applied yet.</div>
                                ) : Object.entries(currentState).map(([region, materialId]) => {
                                    const preset = presetsMap[materialId];
                                    if (!preset) return null;
                                    return (
                                        <div key={region} className="p-4 flex flex-wrap gap-2 items-center justify-between transition-colors hover:bg-white/5">
                                            <span className="font-bold text-neutral-300 text-xs uppercase tracking-tight">{getRegionLabel(region)}</span>
                                            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                <div className="w-5 h-5 rounded-md border border-white/10 shadow-sm shrink-0"
                                                    style={{ backgroundColor: preset.swatchHex, backgroundImage: preset.thumbnailUrl ? `url(${preset.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight">{preset.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Key Notes */}
                        {regionComments.length > 0 && (
                            <div className="pb-4">
                                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">Key Notes</h3>
                                <div className="space-y-3">
                                    {regionComments.map((c, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 transition-all hover:bg-white/10">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{getRegionLabel(c.region)}</span>
                                                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{c.authorName}</span>
                                            </div>
                                            <p className="text-xs text-neutral-200 leading-relaxed italic">"{c.body}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Drawer>
    );
}
