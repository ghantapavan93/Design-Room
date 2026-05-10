import * as React from 'react';
import { DesignVersion, MaterialPreset, DesignElement } from '../../lib/types';
import { DesignRegion } from '../../lib/regions';
import { PreviewCanvas } from './preview_canvas';
import { Button } from '../ui/button';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';
import { regionLabel } from './project_readiness_panel';

interface OptionCompareProps {
    version: DesignVersion; // The version initially selected to trigger compare
    currentState: Record<DesignRegion, string>;
    versions: DesignVersion[];
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

type ComparisonSelection = {
    type: 'current' | 'original' | 'version';
    id?: string;
    label: string;
    state: Record<string, string>;
};

function MaterialCard({ label, preset, accent }: { label: string; preset?: MaterialPreset; accent: string }) {
    if (!preset) return (
        <div className="flex-1 rounded-xl p-3 border border-neutral-700 bg-neutral-800/20 flex flex-col gap-2 italic text-[10px] text-neutral-500 justify-center items-center">
            Original State (No Material)
        </div>
    );
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
    versions,
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
    // Selection state for left and right panes
    const [leftId, setLeftId] = React.useState<string>('current');
    const [rightId, setRightId] = React.useState<string>(version.id);

    const [newLabel, setNewLabel] = React.useState(() => `Option ${Math.floor(Math.random() * 90) + 10}`);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isFinalizing, setIsFinalizing] = React.useState(false);

    // Build the list of available selections
    const allSelections = React.useMemo(() => {
        const items: ComparisonSelection[] = [
            { type: 'current', id: 'current', label: 'Current Design', state: currentState },
            { type: 'original', id: 'original', label: 'Original House', state: {} }
        ];
        versions.forEach(v => {
            items.push({ 
                type: 'version', 
                id: v.id, 
                label: v.label, 
                state: (v.snapshotStateJson || {}) as Record<string, string> 
            });
        });
        return items;
    }, [currentState, versions]);

    const left = allSelections.find(s => s.id === leftId) || allSelections[0];
    const right = allSelections.find(s => s.id === rightId) || allSelections[1];

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
        if (!onMarkFinal || isFinalizing || right.type !== 'version') return;
        setIsFinalizing(true);
        try { await onMarkFinal(right.id!); } finally { setIsFinalizing(false); }
    };

    const leftTotal = computeEstimate(left.state, presetsMap, MOCK_MEASUREMENTS).total;
    const rightTotal = computeEstimate(right.state, presetsMap, MOCK_MEASUREMENTS).total;
    const diff = rightTotal - leftTotal;
    const diffFormatted = Math.abs(diff).toLocaleString();
    const isMoreExpensive = diff > 0;
    
    // Find regions where the two selected states differ
    const allPossibleRegions = Array.from(new Set([
        ...Object.keys(left.state),
        ...Object.keys(right.state)
    ])) as DesignRegion[];

    const diffedRegions = allPossibleRegions.filter(region => {
        const leftMat = left.state[region];
        const rightMat = right.state[region];
        return leftMat !== rightMat;
    });

    return (
        <div className="fixed inset-0 z-[100] bg-neutral-900 flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 border-b border-neutral-700 px-6 flex items-center justify-between shrink-0 bg-neutral-900 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">Comparison Engine</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-white truncate max-w-[150px]">{left.label}</span>
                            <span className="text-neutral-600 text-xs font-black">VS</span>
                            <span className="text-sm font-bold text-blue-400 truncate max-w-[150px]">{right.label}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-2 mr-4 border-r border-neutral-700 pr-4">
                        <input
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="h-8 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-[10px] uppercase font-bold text-white outline-none w-32"
                            placeholder="Save current..."
                            disabled={isSaving}
                        />
                        <Button variant="outline" className="text-white border-neutral-600 hover:bg-neutral-800 h-8 text-[10px] font-black uppercase tracking-widest" onClick={handleSave} disabled={!newLabel.trim() || isSaving}>
                            {isSaving ? 'Saving...' : 'Save Current'}
                        </Button>
                    </div>

                    {isEditor && onSendForReview && (
                        <Button variant="outline" className="text-amber-300 border-amber-700/50 hover:bg-amber-900/20 h-8 text-[10px] font-black uppercase tracking-widest" onClick={onSendForReview}>
                            Send for Review
                        </Button>
                    )}
                    <Button variant="outline" className="text-white border-neutral-600 hover:bg-neutral-800 h-8 text-[10px] font-black uppercase tracking-widest" onClick={onClose}>Exit</Button>
                    {isEditor && right.type === 'version' && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8 text-[10px] font-black uppercase tracking-widest" onClick={() => onRestore(right.id!)}>Apply {right.label}</Button>
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
                                Price Comparison
                            </span>
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl font-light ${isMoreExpensive ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {isMoreExpensive ? '+' : '-'}${diffFormatted}
                                </span>
                                <div className="text-left leading-tight">
                                    <div className="text-[11px] text-white font-bold truncate max-w-[120px]">{right.label}</div>
                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                        is {isMoreExpensive ? 'more' : 'less'} than {left.label}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Changed region list */}
                    {diffedRegions.length > 0 && (
                        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-fade-up animate-delay-150 pointer-events-auto w-[420px]">
                            <div className="flex flex-wrap gap-1.5">
                                {diffedRegions.slice(0, 8).map(region => {
                                    const toMat = presetsMap[right.state[region as DesignRegion]];
                                    return (
                                        <span key={region} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#d1d5db' }}>
                                            {toMat && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toMat.swatchHex }} />}
                                            {regionLabel(region)}
                                        </span>
                                    );
                                })}
                                {diffedRegions.length > 8 && <span className="text-[9px] font-bold text-neutral-500">+{diffedRegions.length - 8} more</span>}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">
                                Specific material differences
                            </span>
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {diffedRegions.map(region => {
                                    const leftMaterial = presetsMap[left.state[region as DesignRegion]];
                                    const rightMaterial = presetsMap[right.state[region as DesignRegion]];
                                    return (
                                        <div key={region} className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">{regionLabel(region)}</span>
                                            <div className="flex items-stretch gap-2">
                                                <MaterialCard label={left.label} preset={leftMaterial} accent="#9ca3af" />
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <div className="w-px h-6 bg-neutral-700" />
                                                    <span className="text-[9px] font-black text-neutral-600">VS</span>
                                                    <div className="w-px h-6 bg-neutral-700" />
                                                </div>
                                                <MaterialCard label={right.label} preset={rightMaterial} accent="#60a5fa" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {isEditor && right.type === 'version' && onMarkFinal && (
                                <button
                                    onClick={handleFinalize}
                                    disabled={isFinalizing}
                                    className="mt-1 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                    style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                                >
                                    {isFinalizing ? 'Finalizing...' : `✓ Finalize ${right.label}`}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pane Selectors (Floating Dropdowns) */}
                <div className="absolute top-24 left-6 z-30 pointer-events-auto">
                    <select 
                        value={leftId} 
                        onChange={(e) => setLeftId(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 text-[10px] font-black uppercase tracking-widest text-white px-3 py-2 rounded-xl outline-none shadow-2xl ring-4 ring-black/20"
                    >
                        {allSelections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </div>
                <div className="absolute top-24 right-6 z-30 pointer-events-auto text-right">
                    <select 
                        value={rightId} 
                        onChange={(e) => setRightId(e.target.value)}
                        className="bg-blue-900/80 border border-blue-700/50 text-[10px] font-black uppercase tracking-widest text-blue-100 px-3 py-2 rounded-xl outline-none shadow-2xl ring-4 ring-black/20"
                    >
                        {allSelections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </div>

                {/* Left Pane */}
                <div className="flex-1 border-r border-neutral-700 flex flex-col">
                    <div className="h-10 bg-neutral-800/50 flex items-center justify-between px-4 border-b border-neutral-700 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Left Side Selection</span>
                        <span className="text-[10px] text-neutral-300 font-mono tracking-widest uppercase">${Math.round(leftTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            elements={elements}
                            selectedMaterials={left.state as Record<DesignRegion, string>}
                            presetsMap={presetsMap}
                            selectedRegions={[]}
                            passive={true}
                        />
                    </div>
                </div>

                {/* Right Pane */}
                <div className="flex-1 flex flex-col">
                    <div className="h-10 bg-neutral-800/50 flex items-center justify-between px-4 border-b border-neutral-700 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Right Side Selection</span>
                        <span className="text-[10px] text-blue-200 font-mono tracking-widest uppercase">${Math.round(rightTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            elements={elements}
                            selectedMaterials={right.state as Record<DesignRegion, string>}
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
