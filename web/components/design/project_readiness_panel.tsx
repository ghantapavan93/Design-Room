import * as React from 'react';
import { DesignVersion, MaterialPreset } from '../../lib/types';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';

// ── Human-readable region labels ─────────────────────────────────────────────
const REGION_LABELS: Record<string, string> = {
    walls: 'Exterior Walls',
    roof: 'Roof',
    trim: 'Trim',
    windows: 'Windows',
    door: 'Front Door',
    garage: 'Garage Door',
    // Design 2 granular elements
    wall_left_cedar: 'Left Cedar Wall',
    wall_center_white: 'Center Wall',
    wall_right_upper_white: 'Upper Right Wall',
    wall_right_dark_cladding: 'Dark Cladding',
    roof_center_connector: 'Roof Connector',
    entry_canopy: 'Entry Canopy',
    window_left_tall: 'Left Windows',
    window_center_horizontal: 'Center Window',
    window_right_upper: 'Upper Windows',
    entry_glass: 'Entry Glass',
    front_door: 'Front Door',
    garage_door: 'Garage Door',
    // Blank canvas
    mask_walls: 'Exterior Walls',
    mask_roof: 'Roof',
    mask_windows: 'Windows',
    mask_door: 'Front Door',
    mask_garage: 'Garage Door',
};

export function regionLabel(key: string): string {
    return REGION_LABELS[key] ?? key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Readiness state derivation ────────────────────────────────────────────────
export type ReadinessState =
    | 'draft'
    | 'in-progress'
    | 'needs-approval'
    | 'options-saved'
    | 'finalized'
    | 'ready-for-estimate'
    | 'ready-for-proposal';

export const READINESS_META: Record<ReadinessState, { label: string; color: string; bg: string; border: string }> = {
    'draft':              { label: 'Draft',              color: '#9ca3af', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.20)' },
    'in-progress':        { label: 'In Progress',        color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.20)'  },
    'needs-approval':     { label: 'Needs Approval',     color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.28)'  },
    'options-saved':      { label: 'Options Saved',      color: '#818cf8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.20)' },
    'finalized':          { label: 'Finalized',          color: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.20)'  },
    'ready-for-estimate': { label: 'Ready for Estimate', color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.20)'  },
    'ready-for-proposal': { label: 'Ready for Proposal', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)'  },
};

export function deriveReadiness(
    stateJson: Record<string, string>,
    versions: DesignVersion[],
    pendingSuggestions: { region: string }[],
    finalVersionId: string | null | undefined,
    estimateTotal: number,
    exportDone: boolean
): ReadinessState {
    const applied = Object.keys(stateJson).length;
    const hasPending = pendingSuggestions.length > 0;
    const hasFinal = !!finalVersionId;
    const hasVersions = versions.length > 0;

    if (applied === 0) return 'draft';
    if (hasPending) return 'needs-approval';
    if (hasFinal && estimateTotal > 0 && exportDone && !hasPending) return 'ready-for-proposal';
    if (hasFinal && estimateTotal > 0) return 'ready-for-estimate';
    if (hasFinal) return 'finalized';
    if (hasVersions) return 'options-saved';
    return 'in-progress';
}

// ── Check row ─────────────────────────────────────────────────────────────────
function CheckRow({ done, warn, label }: { done: boolean; warn?: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2.5 py-1">
            <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black"
                style={{
                    background: done ? 'rgba(52,211,153,0.15)' : warn ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                    color: done ? '#34d399' : warn ? '#fbbf24' : '#4b5563',
                    border: done ? '1px solid rgba(52,211,153,0.3)' : warn ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {done ? '✓' : warn ? '!' : '–'}
            </span>
            <span
                className="text-[11px] font-medium leading-none"
                style={{ color: done ? '#d1fae5' : warn ? '#fde68a' : '#6b7280' }}
            >
                {label}
            </span>
        </div>
    );
}

// ── Main panel ────────────────────────────────────────────────────────────────
interface ProjectReadinessPanelProps {
    stateJson: Record<string, string>;
    versions: DesignVersion[];
    pendingSuggestions: { region: string }[];
    finalVersionId?: string | null;
    presetsMap: Record<string, MaterialPreset>;
    exportDone: boolean;
    onOpenTakeoff: () => void;
    onOpenExport: () => void;
    isEditor: boolean;
}

export function ProjectReadinessPanel({
    stateJson,
    versions,
    pendingSuggestions,
    finalVersionId,
    presetsMap,
    exportDone,
    onOpenTakeoff,
    onOpenExport,
    isEditor,
}: ProjectReadinessPanelProps) {
    const [expanded, setExpanded] = React.useState(false);

    const estimate = React.useMemo(
        () => computeEstimate(stateJson, presetsMap, MOCK_MEASUREMENTS),
        [stateJson, presetsMap]
    );

    const readiness = deriveReadiness(
        stateJson, versions, pendingSuggestions, finalVersionId, estimate.total, exportDone
    );
    const meta = READINESS_META[readiness];

    const applied    = Object.keys(stateJson).length;
    const hasPending = pendingSuggestions.length > 0;
    const hasFinal   = !!finalVersionId;
    const hasVersions = versions.length > 0;
    const hasEstimate = estimate.total > 0;

    return (
        <div
            className="absolute bottom-[84px] right-5 z-30 w-[224px] rounded-2xl overflow-hidden shadow-2xl"
            style={{
                background: 'rgba(13,13,18,0.94)',
                border: `1px solid ${meta.border}`,
                backdropFilter: 'blur(16px)',
            }}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 gap-2"
            >
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500">
                    Project Readiness
                </span>
                <div className="flex items-center gap-1.5">
                    <span
                        className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                    >
                        {meta.label}
                    </span>
                    <svg
                        className="w-3 h-3 shrink-0 transition-transform duration-200"
                        style={{ color: '#4b5563', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Expanded checklist */}
            {expanded && (
                <div className="px-3.5 pb-3 border-t border-white/5 pt-2.5">
                    <CheckRow done={applied > 0}  label={`${applied} material${applied !== 1 ? 's' : ''} applied`} />
                    <CheckRow done={!hasPending} warn={hasPending} label={hasPending ? `${pendingSuggestions.length} suggestion pending` : 'No pending suggestions'} />
                    <CheckRow done={hasVersions} label={hasVersions ? `${versions.length} option${versions.length !== 1 ? 's' : ''} saved` : 'No options saved'} />
                    <CheckRow done={hasFinal}    label={hasFinal ? 'Option finalized' : 'No final selection'} />
                    <CheckRow done={hasEstimate} label={hasEstimate ? `Est. $${Math.round(estimate.total).toLocaleString()}` : 'Estimate not run'} />
                    <CheckRow done={exportDone}  label={exportDone ? 'Proposal exported' : 'Proposal not exported'} />

                    {isEditor && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex gap-2">
                            {!hasEstimate && (
                                <button
                                    onClick={onOpenTakeoff}
                                    className="flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-colors"
                                    style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                                >
                                    Run Estimate
                                </button>
                            )}
                            {hasFinal && hasEstimate && !exportDone && (
                                <button
                                    onClick={onOpenExport}
                                    className="flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 rounded-lg transition-colors"
                                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
                                >
                                    Export Proposal
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
