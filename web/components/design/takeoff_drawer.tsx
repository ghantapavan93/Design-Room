import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { MaterialPreset } from '../../lib/types';
import { DesignRegion, DESIGN_REGIONS } from '../../lib/regions';

interface TakeoffDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentState: Record<string, string>;
    presetsMap: Record<string, MaterialPreset>;
}

const MOCK_MEASUREMENTS: Record<string, { value: number; unit: string; baseRate: number }> = {
    walls: { value: 2450, unit: 'sqft', baseRate: 4.5 },
    roof: { value: 1800, unit: 'sqft', baseRate: 3.8 },
    trim: { value: 450, unit: 'linear ft', baseRate: 2.5 },
    windows: { value: 12, unit: 'each', baseRate: 450 },
    door: { value: 1, unit: 'each', baseRate: 1200 },
    garage: { value: 1, unit: 'each', baseRate: 2500 },
};

export function TakeoffDrawer({
    open,
    onOpenChange,
    currentState,
    presetsMap
}: TakeoffDrawerProps) {

    // Calculate estimates based on cost bands
    const calculateLineItem = (region: string) => {
        const materialId = currentState[region];
        const preset = presetsMap[materialId];
        const measure = MOCK_MEASUREMENTS[region];

        if (!preset || !measure) return null;

        let multiplier = 1.0;
        if (preset.cost_band === '$$') multiplier = 1.6;
        if (preset.cost_band === '$$$') multiplier = 2.4;

        const estimatedCost = measure.value * measure.baseRate * multiplier;

        return {
            region,
            label: region.charAt(0).toUpperCase() + region.slice(1),
            preset,
            measure,
            estimatedCost
        };
    };

    const lineItems = Object.keys(currentState)
        .map(calculateLineItem)
        .filter(Boolean) as NonNullable<ReturnType<typeof calculateLineItem>>[];

    const totalEstimate = lineItems.reduce((acc, item) => acc + item.estimatedCost, 0);

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Takeoff & Estimate">
            <div className="flex flex-col h-full overflow-hidden">

                {/* ── Header Metrics ── */}
                <div className="bg-neutral-900 rounded-xl p-4 shrink-0 mb-4 border border-neutral-800 shadow-sm relative overflow-hidden">
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
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                98% 3D Confidence
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Standard Labor
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Line Items ── */}
                <div className="flex-1 overflow-y-auto space-y-3 pb-6">
                    <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2 px-1">Detailed Takeoff</h3>

                    {lineItems.map(item => (
                        <div key={item.region} className="bg-white border text-left transition-all duration-200 overflow-hidden w-full rounded-xl border-neutral-200 p-3 hover:border-neutral-300">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-neutral-900">{item.label}</h4>
                                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                        {item.measure.value.toLocaleString()} {item.measure.unit}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-neutral-900">
                                        ${Math.round(item.estimatedCost).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                                <div
                                    className="w-8 h-8 rounded-md shadow-inner shrink-0"
                                    style={{
                                        backgroundColor: item.preset.swatchHex,
                                        backgroundImage: item.preset.thumbnailUrl ? `url(${item.preset.thumbnailUrl})` : 'none',
                                        backgroundSize: 'cover'
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-neutral-800 truncate">{item.preset.name}</p>
                                    <p className="text-[10px] text-neutral-500 truncate">{item.preset.brand}</p>
                                </div>
                                {item.preset.cost_band && (
                                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100">
                                        {item.preset.cost_band}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="shrink-0 pt-4 border-t border-neutral-200 mt-auto">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Proposal Snapshot
                    </button>
                    <p className="text-center text-[10px] text-neutral-400 mt-2">Exports selected options and measurements to PDF.</p>
                </div>
            </div>
        </Drawer>
    );
}
