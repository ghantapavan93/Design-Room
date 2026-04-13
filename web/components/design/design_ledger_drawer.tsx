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
    regionComments = []
}: DesignLedgerDrawerProps) {
    const [tab, setTab] = React.useState<'activity' | 'summary'>('activity');

    const getActionText = (event: DesignEvent) => {
        switch (event.eventType) {
            case 'apply_material': return 'changed';
            case 'suggest_material': return 'suggested';
            case 'approve_suggestion': return 'approved';
            case 'reject_suggestion': return 'rejected';
            case 'save_version': return 'saved version';
            case 'restore_version': return 'restored version';
            case 'revert_event': return 'reverted';
            default: return 'did something';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'suggest_material': return (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
            );
            case 'approve_suggestion': return (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            );
            case 'save_version': return (
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
            );
            default: return (
                <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                </div>
            );
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Property Ledger">
            <p className="text-[10px] font-medium px-5 -mt-1 mb-2 opacity-50 tracking-wide" style={{ color: 'var(--text-muted)' }}>Tracks material changes, suggestions &amp; version activity</p>
            <div className="flex border-b border-white/10 mb-6 mx-5 mt-4 bg-white/5 rounded-xl p-1 relative z-10">
                <button
                    onClick={() => setTab('activity')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-lg ${tab === 'activity' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setTab('summary')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all rounded-lg ${tab === 'summary' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    Decision Summary
                </button>
            </div>

            <div className="px-5 pb-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                {tab === 'activity' && (
                    <div className="relative border-l border-white/10 ml-3 pb-8 space-y-8">
                        {events.length === 0 && (
                            <p className="text-xs text-neutral-500 pl-8 italic">No history yet. Start designing!</p>
                        )}

                        {events.map((event, idx) => {
                            const toMaterial = event.toMaterialId ? presetsMap[event.toMaterialId] : null;
                            const fromMaterial = event.fromMaterialId ? presetsMap[event.fromMaterialId] : null;

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

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-baseline justify-between">
                                            <div className="text-[11px] text-white leading-relaxed">
                                                <span className="font-black uppercase tracking-tight">{event.actorName}</span>{' '}
                                                <span className="text-neutral-400 font-medium">{getActionText(event)}</span>{' '}
                                                {event.region && <span className="font-black uppercase tracking-tighter text-blue-400">{event.region}</span>}
                                            </div>
                                            <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest pl-2">
                                                {formatTimeAgo(event.createdAt)}
                                            </span>
                                        </div>

                                        {toMaterial && (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mt-1 flex items-center gap-4 transition-all hover:bg-white/10 hover:scale-[1.02]">
                                                <div className="w-10 h-10 rounded-xl border border-white/10 shadow-inner shrink-0" style={{ backgroundColor: toMaterial.swatchHex, backgroundImage: toMaterial.thumbnailUrl ? `url(${toMaterial.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-black uppercase tracking-tight text-white block truncate">{toMaterial.name}</span>
                                                    {fromMaterial && (
                                                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mt-0.5">was {fromMaterial.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {event.note && (
                                            <p className="text-xs text-neutral-300 italic bg-white/5 p-3 rounded-2xl border border-white/5 mt-1 leading-relaxed">
                                                "{event.note}"
                                            </p>
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

                {tab === 'summary' && (
                    <div className="px-1 flex flex-col gap-8 pb-12">

                        {/* Final Status */}
                        <div>
                            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">Project Status</h3>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-white/10">
                                <span className="text-xs font-bold text-neutral-300 uppercase tracking-tight">Current Phase</span>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">{statusChip}</span>
                            </div>
                        </div>

                        {/* Pending Suggestions */}
                        {pendingSuggestion && (
                            <div>
                                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">Pending Review</h3>
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden group flex flex-col gap-4">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full transition-all group-hover:scale-150 pointer-events-none" />

                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                        <span className="font-black text-white text-[11px] uppercase tracking-widest">{pendingSuggestion.region} Suggestion</span>
                                        <span className="text-[10px] text-neutral-400 font-bold ml-auto">{pendingSuggestion.actorName}</span>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 z-10 w-full">
                                        <div className="w-10 h-10 rounded-lg border border-white/10 shadow-inner shrink-0" style={{ backgroundColor: pendingSuggestion.preset.swatchHex, backgroundImage: pendingSuggestion.preset.thumbnailUrl ? `url(${pendingSuggestion.preset.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-black text-white uppercase tracking-tight block truncate">{pendingSuggestion.preset.name}</span>
                                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block truncate">{pendingSuggestion.preset.brand}</span>
                                        </div>
                                    </div>

                                    {isEditor && (
                                        <div className="flex items-center gap-2 z-10 w-full pt-2 border-t border-white/5">
                                            <button
                                                onClick={() => onRejectSuggestion(pendingSuggestion.eventId)}
                                                className="px-4 py-2 flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-400 border border-white/10 hover:bg-white/5 transition-all text-center"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => onApproveSuggestion(pendingSuggestion.eventId)}
                                                className="px-4 py-2 flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg bg-blue-600 hover:bg-blue-500 transition-all text-center"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Approved Changes */}
                        <div>
                            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">Approved Changes</h3>
                            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
                                {Object.keys(currentState).length === 0 && !pendingSuggestion && (
                                    <div className="p-8 text-center text-xs text-neutral-500 italic uppercase tracking-widest">No approved changes yet.</div>
                                )}
                                {Object.entries(currentState).map(([region, materialId]) => {
                                    const preset = presetsMap[materialId];
                                    if (!preset) return null;
                                    return (
                                        <div key={region} className="p-4 flex items-center justify-between transition-colors hover:bg-white/5">
                                            <span className="font-bold text-neutral-300 text-xs uppercase tracking-tight">{region}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-md border border-white/10 shadow-sm" style={{ backgroundColor: preset.swatchHex, backgroundImage: preset.thumbnailUrl ? `url(${preset.thumbnailUrl})` : 'none', backgroundSize: 'cover' }} />
                                                <span className="text-[11px] font-black text-white uppercase tracking-tight">{preset.name}</span>
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
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{c.region}</span>
                                                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{c.authorName}</span>
                                            </div>
                                            <p className="text-xs text-neutral-200 leading-relaxed italic">"{c.body}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Export actions */}
                        <div className="pt-6 border-t border-white/5 flex gap-3">
                            <button className="flex-1 py-3 px-4 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.15em] hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shadow-white/5">
                                Export Pack
                            </button>
                            <button className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white/5 transition-all active:scale-95">
                                Copy Specs
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
}
