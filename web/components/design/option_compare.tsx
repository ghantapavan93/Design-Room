import * as React from 'react';
import { DesignVersion, MaterialPreset } from '../../lib/types';
import { DesignRegion } from '../../lib/regions';
import { PreviewCanvas } from './preview_canvas';
import { Button } from '../ui/button';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';

interface OptionCompareProps {
    version: DesignVersion;
    currentState: Record<DesignRegion, string>;
    presetsMap: Record<string, MaterialPreset>;
    baseImageUrl: string;
    masksUrlPrefix: string;
    onClose: () => void;
    onRestore: (versionId: string) => void;
    onSaveCurrentAsOption: (label: string) => Promise<void>;
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
    onClose,
    onRestore,
    onSaveCurrentAsOption,
    isEditor
}: OptionCompareProps) {
    const [newLabel, setNewLabel] = React.useState(() => `Option ${Math.floor(Math.random() * 90) + 10}`);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        if (!newLabel.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await (onSaveCurrentAsOption(newLabel) as any);
        } finally {
            setIsSaving(false);
        }
    };

    const currentTotal = computeEstimate(currentState, presetsMap, MOCK_MEASUREMENTS).total;
    const versionTotal = computeEstimate((version.snapshotStateJson || {}), presetsMap, MOCK_MEASUREMENTS).total;
    const diff = versionTotal - currentTotal;

    const diffFormatted = Math.abs(diff).toLocaleString();
    const isMoreExpensive = diff > 0;

    // Compute diffs for Swatches
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
                        <h2 className="text-lg font-semibold">Comparing Options</h2>
                        <p className="text-xs text-neutral-400">Current Work vs. {version.label}</p>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <input
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white outline-none"
                        placeholder="New option name"
                        disabled={isSaving}
                    />
                    <Button
                        variant="outline"
                        className="text-white border-neutral-600 hover:bg-neutral-800"
                        onClick={handleSave}
                        disabled={!newLabel.trim() || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save current'}
                    </Button>

                    <Button variant="outline" className="text-white border-neutral-600 hover:bg-neutral-800" onClick={onClose}>
                        Exit
                    </Button>

                    {isEditor && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0" onClick={() => onRestore(version.id)}>
                            Apply {version.label}
                        </Button>
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

                    {/* Material Diffs */}
                    {diffedRegions.length > 0 && (
                        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-fade-up animate-delay-150 pointer-events-auto w-[400px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">
                                Swapped Materials
                            </span>
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {diffedRegions.map(region => {
                                    const currMaterial = presetsMap[currentState[region as DesignRegion]];
                                    const verMaterial = presetsMap[version.snapshotStateJson[region as DesignRegion]];
                                    if (!currMaterial || !verMaterial) return null;

                                    return (
                                        <div key={region} className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">
                                                {region}
                                            </span>
                                            <div className="flex items-stretch gap-2">
                                                <MaterialCard label="Current Work" preset={currMaterial} accent="#9ca3af" />
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <div className="w-px h-6 bg-neutral-700" />
                                                    <span className="text-[9px] font-black text-neutral-600">VS</span>
                                                    <div className="w-px h-6 bg-neutral-700" />
                                                </div>
                                                <MaterialCard label={version.label} preset={verMaterial} accent="#60a5fa" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Left Side: Current State */}
                <div className="flex-1 border-r border-neutral-700 flex flex-col">
                    <div className="h-12 bg-neutral-800/50 flex items-center justify-between px-4 border-b border-neutral-700 shrink-0">
                        <span className="text-sm font-medium text-white px-3 py-1 bg-neutral-700 rounded-full">Current Design</span>
                        <span className="text-xs text-neutral-400 font-mono tracking-widest uppercase">${Math.round(currentTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            selectedMaterials={currentState}
                            presetsMap={presetsMap}
                            selectedRegions={[]}
                            passive={true}
                        />
                    </div>
                </div>

                {/* Right Side: Version State */}
                <div className="flex-1 flex flex-col">
                    <div className="h-12 bg-neutral-800/50 flex items-center justify-between px-4 border-b border-neutral-700 shrink-0">
                        <span className="text-sm font-medium text-blue-200 px-3 py-1 bg-blue-900/50 rounded-full">{version.label}</span>
                        <span className="text-xs text-blue-200/70 font-mono tracking-widest uppercase">${Math.round(versionTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
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
