import * as React from 'react';
import { DesignVersion, MaterialPreset } from '../../lib/types';
import { DesignRegion } from '../../lib/regions';
import { PreviewCanvas } from './preview_canvas';
import { Button } from '../ui/button';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';
import { regionLabel } from './project_readiness_panel';

import { DesignElement } from '../../lib/types';

interface OptionCompareProps {
    version: DesignVersion;
    currentState: Record<DesignRegion, string>;
    presetsMap: Record<string, MaterialPreset>;
    baseImageUrl: string;
    masksUrlPrefix: string;
    elements: DesignElement[];
    onClose: () => void;
    onRestore: (versionId: string) => void;
    onSaveCurrentAsOption: (label: string) => Promise<void>;
    onMarkFinal?: (versionId: string) => Promise<void>;
    onSendForReview?: () => void;
    isEditor: boolean;
}

function MaterialCard({ label, preset, accent }: { label: string; preset?: MaterialPreset; accent: string }) {
    if (!preset) return null;
    return (
        <div className="flex-1 rounded-xl p-3 border border-neutral-700 bg-neutral-800/50 flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.1em] opacity-80" style={{ color: accent }}>{label}</span>
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg shadow-inner shrink-0 border border-neutral-600"
                    style={{
                        backgroundColor: preset.swatchHex,
                        backgroundImage: preset.thumbnailUrl ? `url(${preset.thumbnailUrl})` : 'none',
                        backgroundSize: 'cover'
                    }}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">{preset.name}</p>
                    <p className="text-[9px] font-bold text-neutral-400 truncate uppercase tracking-widest block leading-none">{preset.brand}</p>
                </div>
            </div>
        </div>
    );
}

export function OptionCompare({
    version,
    currentState,
    presetsMap,
    baseImageUrl,
    masksUrlPrefix,
    elements,
    onClose,
    onRestore,
    onSaveCurrentAsOption,
    onMarkFinal,
    onSendForReview,
    isEditor
}: OptionCompareProps) {
    const [newLabel, setNewLabel] = React.useState(() => `Option ${Math.floor(Math.random() * 90) + 10}`);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isFinalizing, setIsFinalizing] = React.useState(false);

    const handleSave = async () => {
        if (!newLabel.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await (onSaveCurrentAsOption(newLabel) as any);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalize = async () => {
        if (!onMarkFinal || isFinalizing) return;
        setIsFinalizing(true);
        try { await onMarkFinal(version.id); } finally { setIsFinalizing(false); }
    };

    const currentTotal = computeEstimate(currentState, presetsMap, MOCK_MEASUREMENTS).total;
    const versionTotal = computeEstimate((version.snapshotStateJson || {}), presetsMap, MOCK_MEASUREMENTS).total;
    const diff = versionTotal - currentTotal;
    const diffFormatted = Math.abs(diff).toLocaleString();
    const isMoreExpensive = diff > 0;
    const diffedRegions = Object.keys(currentState).filter(region => currentState[region as DesignRegion] !== version.snapshotStateJson[region as DesignRegion]);

    return (
        <div className="fixed inset-0 z-[100] bg-neutral-900 flex flex-col animate-in fade-in duration-300">
            <div className="h-16 border-b border-neutral-700 px-6 flex items-center justify-between shrink-0 bg-neutral-900 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-sm font-bold text-white">Current Design  ↔  {version.label}</h2>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                            {diffedRegions.length} region{diffedRegions.length !== 1 ? 's' : ''} differ
                            {diff !== 0 && (
                                <> &nbsp;·&nbsp; <span className={isMoreExpensive ? 'text-rose-400' : 'text-emerald-400'}>{isMoreExpensive ? '+' : '-'}${diffFormatted} scope impact</span></>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    <input
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="h-8 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white outline-none"
                        placeholder="Save current as..."
                        disabled={isSaving}
                    />
                    <Button variant="outline" className="text-white border-neutral-600 hover:bg-neutral-800 h-8 text-xs" onClick={handleSave} disabled={!newLabel.trim() || isSaving}>
                        {isSaving ? 'Saving...' : 'Save current'}
                    </Button>
                    {isEditor && onSendForReview && (
                        <Button variant="outline" className="text-amber-300 border-amber-700/50 hover:bg-amber-900/20 h-8 text-xs" onClick={onSendForReview}>
                            Send for Review
                        </Button>
                    )}
                    <Button variant="outline" className="text-white border-neutral-600 hover:bg-neutral-800 h-8 text-xs" onClick={onClose}>Exit</Button>
                    {isEditor && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8 text-xs" onClick={() => onRestore(version.id)}>Apply {version.label}</Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Floating Diff Summary Block */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none">

                    {/* Estimate Impact */}
                    {diff !== 0 && (
                        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl p-4 flex flex-col items-center animate-fade-up pointer-events-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                Estimate Impact
                            </span>
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl font-light ${isMoreExpensive ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {isMoreExpensive ? '+' : '-'}${diffFormatted}
                                </span>
                                <div className="text-left leading-tight">
                                    <div className="text-[11px] text-white font-bold">{version.label}</div>
                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                        is {isMoreExpensive ? 'more' : 'less'} than current
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Changed region chip rail + diff cards */}
                    {diffedRegions.length > 0 && (
                        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-fade-up animate-delay-150 pointer-events-auto w-[400px]">
                            {/* Region chip rail */}
                            <div className="flex flex-wrap gap-1.5">
                                {diffedRegions.map(region => {
                                    const toMat = presetsMap[version.snapshotStateJson[region as DesignRegion]];
                                    return (
                                        <span key={region} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#d1d5db' }}>
                                            {toMat && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toMat.swatchHex }} />}
                                            {regionLabel(region)}
                                        </span>
                                    );
                                })}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">
                                Material Changes
                            </span>
                            <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                                {diffedRegions.map(region => {
                                    const currMaterial = presetsMap[currentState[region as DesignRegion]];
                                    const verMaterial = presetsMap[version.snapshotStateJson[region as DesignRegion]];
                                    if (!currMaterial || !verMaterial) return null;
                                    return (
                                        <div key={region} className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">{regionLabel(region)}</span>
                                            <div className="flex items-stretch gap-2">
                                                <MaterialCard label="Current" preset={currMaterial} accent="#9ca3af" />
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <div className="w-px h-6 bg-neutral-700" />
                                                    <span className="text-[9px] font-black text-neutral-600">→</span>
                                                    <div className="w-px h-6 bg-neutral-700" />
                                                </div>
                                                <MaterialCard label={version.label} preset={verMaterial} accent="#60a5fa" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Finalize shortcut */}
                            {isEditor && onMarkFinal && (
                                <button
                                    onClick={handleFinalize}
                                    disabled={isFinalizing}
                                    className="mt-1 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                    style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                                >
                                    {isFinalizing ? 'Finalizing...' : `✓ Finalize ${version.label}`}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Left: Current */}
                <div className="flex-1 border-r border-neutral-700 flex flex-col">
                    <div className="h-12 bg-neutral-800/50 flex items-center justify-between px-4 border-b border-neutral-700 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-neutral-300 px-3 py-1 bg-neutral-700 rounded-full">← Current</span>
                        </div>
                        <span className="text-xs text-neutral-400 font-mono tracking-widest uppercase">${Math.round(currentTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            elements={elements}
                            selectedMaterials={currentState}
                            presetsMap={presetsMap}
                            selectedRegions={[]}
                            passive={true}
                        />
                    </div>
                </div>

                {/* Right: Version */}
                <div className="flex-1 flex flex-col">
                    <div className="h-12 bg-neutral-800/50 flex items-center justify-between px-4 border-b border-neutral-700 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-blue-200 px-3 py-1 bg-blue-900/50 rounded-full">{version.label} →</span>
                        </div>
                        <span className="text-xs text-blue-200/70 font-mono tracking-widest uppercase">${Math.round(versionTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            elements={elements}
                            selectedMaterials={version.snapshotStateJson as Record<DesignRegion, string>}
                            presetsMap={presetsMap}
                            selectedRegions={[]}
                            passive={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
