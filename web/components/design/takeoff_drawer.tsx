import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { MaterialPreset, DesignVersion } from '../../lib/types';
import { openProposalInNewTab } from './proposal_export';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';

interface TakeoffDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentState: Record<string, string>;
    presetsMap: Record<string, MaterialPreset>;
    designTitle: string;
    versions: DesignVersion[];
    statusChip: string;
    lockedRegions?: string[];
    regionComments?: { region: string; body: string; authorName: string }[];
    onExport?: () => void;
}

export function TakeoffDrawer({
    open,
    onOpenChange,
    currentState,
    presetsMap,
    designTitle,
    versions,
    statusChip,
    lockedRegions = [],
    regionComments = [],
    onExport
}: TakeoffDrawerProps) {

    const estimate = computeEstimate(currentState, presetsMap, MOCK_MEASUREMENTS);
    const lineItems = estimate.items.map(item => ({
        ...item,
        label: item.region.charAt(0).toUpperCase() + item.region.slice(1),
        preset: presetsMap[item.presetId]
    }));
    const totalEstimate = estimate.total;
    const { measurementSource, measurementConfidence, assumptions } = estimate.metadata;

    // Map engine metadata to display labels
    const sourceLabel = measurementSource === 'demo_default' ? 'Demo Default' : measurementSource === 'lidar_scan' ? 'LIDAR Scan' : measurementSource.charAt(0).toUpperCase() + measurementSource.slice(1);
    const confidenceLabel = measurementConfidence.charAt(0).toUpperCase() + measurementConfidence.slice(1);

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title="Takeoff & Estimate"
            panelClassName="max-w-md lg:max-w-lg"
            contentClassName="flex flex-col h-full overflow-hidden"
        >
            <div className="flex flex-col h-full bg-neutral-50 border-l border-neutral-200">

                {/* ── Header Metrics ── */}
                <div className="bg-neutral-900 px-6 py-5 shrink-0 relative overflow-hidden shadow-sm z-10">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />

                    <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3">Project Scope</h3>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-light text-white tracking-tight">
                                ${Math.round(totalEstimate).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-mono">Estimated Material & Labor</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <div className={`w - 1.5 h - 1.5 rounded - full animate - pulse ${confidenceLabel === 'High' ? 'bg-emerald-400' : confidenceLabel === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'} `} />
                                {sourceLabel} source · {confidenceLabel} confidence
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Standard Labor
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Line Items ── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {lockedRegions.length > 0 ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm mb-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900">Locked scope: {lockedRegions.length} of {Object.keys(currentState).length} regions</h4>
                                <p className="text-xs text-emerald-700 mt-0.5">Unlocked items are subject to change based on design revisions.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Project scope is unlocked</h4>
                                <p className="text-xs text-blue-700 mt-0.5">All items are subject to change. Lock regions to finalize estimates.</p>
                            </div>
                        </div>
                    )}
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Detailed Takeoff</h3>

                    {lineItems.map(item => (
                        <div key={item.region} className="bg-white border text-left transition-all duration-300 overflow-hidden w-full rounded-2xl p-5 hover:shadow-md shadow-sm relative group" style={{ borderColor: 'var(--border-default)' }}>
                            <div className="flex justify-between items-start pb-4 mb-4 border-b border-neutral-100">
                                <div className="flex flex-col gap-2">
                                    <h4 className="font-black text-[11px] uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{item.label}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-lg border ml-0.5" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
                                            {item.qty.toLocaleString()} {item.unit.toUpperCase()}
                                        </span>
                                        {lockedRegions.includes(item.region) && (
                                            <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center gap-1 shadow-sm">
                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                FINAL
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                        ${Math.round(item.cost).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-xl p-3 border transition-colors" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                                <div
                                    className="w-10 h-10 rounded-lg shadow-inner shrink-0 border border-white/10"
                                    style={{
                                        backgroundColor: item.preset.swatchHex,
                                        backgroundImage: item.preset.thumbnailUrl ? `url(${item.preset.thumbnailUrl})` : 'none',
                                        backgroundSize: 'cover'
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{item.preset.name}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>{item.preset.brand}</p>
                                </div>
                                {item.preset.costBand && (
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 uppercase tracking-widest">
                                        {item.preset.costBand}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Assumptions */}
                    {assumptions.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-neutral-200">
                            <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">Assumptions</h4>
                            <ul className="space-y-1.5">
                                {assumptions.map((a, i) => (
                                    <li key={i} className="text-[11px] text-neutral-500 flex items-start gap-2">
                                        <span className="text-neutral-300 mt-0.5">•</span>
                                        <span>{a}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="shrink-0 p-8 bg-white border-t z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] mt-auto" style={{ borderTopColor: 'var(--border-subtle)' }}>
                    <button
                        id="export-proposal-btn"
                        onClick={() => {
                            onExport?.();
                            openProposalInNewTab({ designTitle, currentState, presetsMap, versions, statusChip, lockedRegions, regionComments });
                        }}
                        className="w-full font-black text-xs uppercase tracking-[0.1em] py-4 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 shadow-[0_8px_30px_-8px_var(--text-primary)] hover:shadow-[0_12px_40px_-10px_var(--text-primary)] relative overflow-hidden group"
                        style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Proposal
                    </button>
                    <p className="text-center text-[8px] font-bold text-neutral-600 mt-3 uppercase tracking-widest">Proposal ready PDF</p>
                </div>
                <style jsx>{`
@keyframes shimmer {
    100 % { transform: translateX(100 %); }
}
`}</style>
            </div>
        </Drawer>
    );
}
