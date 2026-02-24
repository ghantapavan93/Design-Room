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
    pendingSuggestion?: { region: string, preset: MaterialPreset } | null;
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
    pendingSuggestion
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

            <div className="flex border-b border-neutral-200 mb-4 mx-4 mt-2">
                <button
                    onClick={() => setTab('activity')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors border-b-2 ${tab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setTab('summary')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors border-b-2 ${tab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
                >
                    Decision Summary
                </button>
            </div>

            <div className="px-1 pb-8">
                {tab === 'activity' && (
                    <div className="relative border-l border-neutral-200 ml-3 pb-8 space-y-6">
                        {events.length === 0 && (
                            <p className="text-sm text-neutral-500 pl-6 italic">No history yet. Start designing!</p>
                        )}

                        {events.map((event, idx) => {
                            const toMaterial = event.toMaterialId ? presetsMap[event.toMaterialId] : null;
                            const fromMaterial = event.fromMaterialId ? presetsMap[event.fromMaterialId] : null;

                            return (
                                <div
                                    key={event.id}
                                    className="relative pl-6 group"
                                    onMouseEnter={() => onEventHover(event.region)}
                                    onMouseLeave={() => onEventHover(undefined)}
                                >
                                    <div className="absolute -left-3 top-0 rounded-full bg-white ring-4 ring-white">
                                        {getEventIcon(event.eventType)}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-baseline justify-between">
                                            <p className="text-sm text-neutral-900">
                                                <span className="font-semibold">{event.actorName}</span>{' '}
                                                <span className="text-neutral-600">{getActionText(event)}</span>{' '}
                                                {event.region && <span className="font-medium capitalize text-neutral-800">{event.region}</span>}
                                            </p>
                                            <span className="text-xs text-neutral-400 whitespace-nowrap pl-2">
                                                {formatTimeAgo(event.createdAt)}
                                            </span>
                                        </div>

                                        {toMaterial && (
                                            <div className="bg-neutral-50 border border-neutral-100 rounded-md p-2 mt-1 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded border border-neutral-200" style={{ backgroundColor: toMaterial.swatchHex }} />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium">{toMaterial.name}</span>
                                                    {fromMaterial && (
                                                        <span className="text-[10px] text-neutral-500 line-through decoration-neutral-400">was {fromMaterial.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {event.note && (
                                            <p className="text-sm text-neutral-600 italic bg-yellow-50/50 p-2 rounded border border-yellow-100 mt-1">
                                                "{event.note}"
                                            </p>
                                        )}

                                        {isEditor && event.eventType === 'apply_material' && idx === 0 && (
                                            <button
                                                onClick={() => onRevertEvent(event.id)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 self-start mt-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
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
                    <div className="px-3 flex flex-col gap-6">

                        {/* Final Status */}
                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Project Status</h3>
                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex justify-between items-center">
                                <span className="font-medium text-neutral-700">Current Phase</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">{statusChip}</span>
                            </div>
                        </div>

                        {/* Pending Suggestions */}
                        {pendingSuggestion && (
                            <div>
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Pending Review</h3>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="font-semibold text-blue-800 text-sm capitalize">{pendingSuggestion.region} Suggestion</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-6 h-6 rounded border border-neutral-200" style={{ backgroundColor: pendingSuggestion.preset.swatchHex }} />
                                        <span className="text-xs font-medium text-blue-900">{pendingSuggestion.preset.name}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Approved Changes */}
                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Approved Changes</h3>
                            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 overflow-hidden">
                                {Object.keys(currentState).length === 0 && !pendingSuggestion && (
                                    <div className="p-4 text-center text-sm text-neutral-500 italic">No approved changes yet.</div>
                                )}
                                {Object.entries(currentState).map(([region, materialId]) => {
                                    const preset = presetsMap[materialId];
                                    if (!preset) return null;
                                    return (
                                        <div key={region} className="p-3 flex items-center justify-between bg-white">
                                            <span className="font-medium text-neutral-700 text-sm capitalize">{region}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded border border-neutral-200" style={{ backgroundColor: preset.swatchHex }} />
                                                <span className="text-sm text-neutral-900">{preset.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Export actions */}
                        <div className="pt-4 border-t border-neutral-100 flex gap-2">
                            <button className="flex-1 py-2 px-4 rounded-md bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors">
                                Export .zip Pack
                            </button>
                            <button className="flex-1 py-2 px-4 rounded-md border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors">
                                Copy as Markdown
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
}
