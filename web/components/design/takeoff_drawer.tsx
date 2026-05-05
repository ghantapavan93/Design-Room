import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { MaterialPreset, DesignVersion, DesignElement } from '../../lib/types';
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
    elements?: DesignElement[];
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
    elements = [],
    onExport
}: TakeoffDrawerProps) {

    // Map IDs to measurement keys
    const mappedState: Record<string, string> = {};
    const originalKeys: Record<string, string> = {};
    for (const [k, v] of Object.entries(currentState)) {
        const el = elements.find(e => e.id === k);
        const mKey = el ? el.maskUrl.replace('.png', '') : k;
        mappedState[mKey] = v;
        originalKeys[mKey] = k;
    }

    const estimate = computeEstimate(mappedState, presetsMap, MOCK_MEASUREMENTS);
    const lineItems = estimate.items.map(item => {
        const originalId = originalKeys[item.region] || item.region;
        const el = elements.find(e => e.id === originalId);
        return {
            ...item,
            originalId,
            label: el ? el.label : item.region.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            preset: presetsMap[item.presetId]
        };
    });
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
            panelClassName="w-full sm:w-[480px]"
            contentClassName="flex flex-col h-full overflow-hidden p-0"
        >
            <div className="flex flex-col h-full bg-[#0f0f12]">

                {/* ── Header Metrics ── */}
                <div className="bg-[#121216]/50 px-6 py-5 shrink-0 relative overflow-hidden border-b border-white/5 z-10">
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
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${confidenceLabel === 'High' ? 'bg-emerald-400' : confidenceLabel === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'}`} />
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
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm mb-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-100">Locked scope: {lockedRegions.length} of {Object.keys(currentState).length} regions</h4>
                                <p className="text-xs text-emerald-500 mt-0.5">Unlocked items are subject to change based on design revisions.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#1a1a1f] border border-blue-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Assumptions & Exclusions
                            </h4>
                            <ul className="space-y-2">
                                {assumptions.map((ass, i) => (
                                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        {ass}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Detailed Takeoff</h3>

                    {lineItems.map(item => (
                        <div key={item.region} className="bg-[#121216] border border-white/5 text-left transition-all duration-300 overflow-hidden w-full rounded-2xl p-5 hover:border-white/10 shadow-sm relative group">
                            <div className="flex justify-between items-start pb-4 mb-4 border-b border-white/5">
                                <div className="flex flex-col gap-2">
                                    <h4 className="font-black text-[11px] uppercase tracking-tight text-white">{item.label}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-lg border border-white/5 bg-white/5 text-neutral-300 ml-0.5">
                                            {item.qty.toLocaleString()} {item.unit.toUpperCase()}
                                        </span>
                                        {lockedRegions.includes(item.originalId) && (
                                            <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                FINAL
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black tracking-tight text-white">
                                        ${Math.round(item.cost).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-xl p-3 border border-white/5 bg-white/5 transition-colors">
                                <div
                                    className="w-10 h-10 rounded-lg shadow-inner shrink-0 border border-white/10"
                                    style={{
                                        backgroundColor: item.preset.swatchHex,
                                        backgroundImage: item.preset.thumbnailUrl ? `url(${item.preset.thumbnailUrl})` : 'none',
                                        backgroundSize: 'cover'
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-white truncate">{item.preset.name}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 truncate">{item.preset.brand}</p>
                                </div>
                                {item.preset.costBand && (
                                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                                        {item.preset.costBand}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="bg-[#121216]/50 px-6 py-4 shrink-0 border-t border-white/5 backdrop-blur-md relative z-20">
                    <button
                        id="export-proposal-btn"
                        onClick={() => {
                            onExport?.();
                            openProposalInNewTab({ designTitle, currentState, presetsMap, versions, statusChip, lockedRegions, regionComments, elements });
                        }}
                        className="w-full group relative overflow-hidden rounded-xl bg-white px-4 py-3.5 text-black font-bold text-sm transition-all hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export Final Proposal</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                    <p className="text-[10px] text-center text-neutral-500 mt-3 tracking-widest uppercase">Generates client-ready PDF</p>
                </div>
            </div>
        </Drawer>
    );
}
