import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { DesignVersion, MaterialPreset } from '../../lib/types';
import { formatDateTime } from '../../lib/time';
import { computeEstimate, MOCK_MEASUREMENTS } from '../../lib/estimate_engine';

interface OptionsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    versions: DesignVersion[];
    currentState: Record<string, string>;
    finalVersionId?: string | null;
    presetsMap: Record<string, MaterialPreset>;
    onSaveVersion: (label: string) => Promise<void>;
    onCompare: (version: DesignVersion) => void;
    onRestore: (versionId: string) => void;
    onMarkFinal: (versionId: string) => void;
    isEditor: boolean;
}

export function OptionsDrawer({
    open,
    onOpenChange,
    versions,
    currentState,
    finalVersionId,
    presetsMap,
    onSaveVersion,
    onCompare,
    onRestore,
    onMarkFinal,
    isEditor
}: OptionsDrawerProps) {
    const [newVersionLabel, setNewVersionLabel] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    // Update the suggested label whenever the number of versions changes
    React.useEffect(() => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nextLetter = versions.length < letters.length ? letters[versions.length] : String(versions.length + 1);
        const suggested = `Option ${nextLetter}`;
        // Only set the suggestion if the field is empty or already has a default suggestion
        if (!newVersionLabel || newVersionLabel.startsWith('Option ')) {
            setNewVersionLabel(suggested);
        }
    }, [versions.length]);

    const handleSave = async () => {
        if (!newVersionLabel.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await onSaveVersion(newVersionLabel.trim());
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Pre-compute estimates for all versions to find the cheapest (Best Value)
    const versionEstimates = React.useMemo(() => {
        return versions.map(v => ({
            id: v.id,
            estimate: computeEstimate((v.snapshotStateJson || {}) as Record<string, string>, presetsMap, MOCK_MEASUREMENTS).total,
        }));
    }, [versions, presetsMap]);

    const minEstimate = versionEstimates.length > 0
        ? Math.min(...versionEstimates.map(v => v.estimate))
        : 0;

    // Compute quality score per version (avg cost band: $=1, $$=2, $$$=3)
    const versionQualityScores = React.useMemo(() => {
        return versions.map(v => {
            const entries = Object.values(v.snapshotStateJson || {}) as string[];
            if (entries.length === 0) return { id: v.id, score: 0 };
            const totalScore = entries.reduce((sum, matId) => {
                const p = presetsMap[matId];
                if (!p || !p.costBand) return sum + 1;
                if (p.costBand === '$$$') return sum + 3;
                if (p.costBand === '$$') return sum + 2;
                return sum + 1;
            }, 0);
            return { id: v.id, score: totalScore / entries.length };
        });
    }, [versions, presetsMap]);

    const maxQualityScore = versionQualityScores.length > 0
        ? Math.max(...versionQualityScores.map(v => v.score))
        : 0;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Saved Options">
            <div className="flex flex-col h-full">
                {isEditor && (
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-6 shrink-0">
                        <h3 className="text-sm font-semibold mb-2">Save Current Design</h3>
                        <p className="text-xs text-neutral-500 mb-3">Save the current state as a labeled option (e.g. &quot;Option A&quot;) to compare later.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Option Label..."
                                className="flex-1 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                                value={newVersionLabel}
                                onChange={e => setNewVersionLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                            />
                            <Button onClick={handleSave} disabled={!newVersionLabel.trim() || isSaving} className="shrink-0 h-auto py-1.5 px-6 ml-1">
                                Save
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-3">
                    {versions.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm">No options saved yet.</p>
                        </div>
                    ) : (
                        versions.map((version: DesignVersion) => {
                            const isCurrent = JSON.stringify(version.snapshotStateJson || {}) === JSON.stringify(currentState);
                            const isFinal = version.id === finalVersionId;
                            const estimate = versionEstimates.find(v => v.id === version.id)?.estimate ?? 0;
                            const isBestValue = estimate === minEstimate && versionEstimates.length > 1;
                            const qualityScore = versionQualityScores.find(v => v.id === version.id)?.score ?? 0;
                            const isRecommended = qualityScore === maxQualityScore && versionQualityScores.length > 1 && !isFinal;

                            // Material swatches from snapshot
                            const swatches = Object.values(version.snapshotStateJson || {})
                                .map(matId => presetsMap[matId as string])
                                .filter(Boolean)
                                .slice(0, 6);



                            return (
                                <div
                                    key={version.id}
                                    className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${isFinal
                                        ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                        : 'border-white/10 bg-white shadow-sm hover:shadow-xl hover:border-blue-500/30'
                                        }`}
                                >
                                    {/* Glass Overlay for hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="p-4 relative z-10">
                                        {/* Status Badges - Floating Style */}
                                        <div className="flex flex-wrap items-center gap-1.5 mb-3 mt-1 px-0.5">
                                            {isFinal && (
                                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center gap-1 animate-in zoom-in duration-300">
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Final Selection
                                                </span>
                                            )}
                                            {isRecommended && !isFinal && (
                                                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20 uppercase tracking-widest flex items-center gap-1">
                                                    ⭐ Recommended
                                                </span>
                                            )}
                                            {isBestValue && !isFinal && (
                                                <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/20 uppercase tracking-widest">
                                                    Best Value
                                                </span>
                                            )}
                                            {isCurrent && !isFinal && (
                                                <span className="bg-neutral-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/20">
                                                    Current Design
                                                </span>
                                            )}
                                        </div>

                                        {/* Title + Date */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-extrabold text-neutral-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{version.label}</h4>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                                    {version.createdBy} <span className="mx-1 opacity-30">•</span> {formatDateTime(version.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Est. Total</p>
                                                <p className="text-sm font-black text-neutral-900 mt-0.5">${Math.round(estimate).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Material Swatches - Visual Grid */}
                                        <div className="mt-4 flex items-center gap-1">
                                            {swatches.map((preset, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-6 h-6 rounded-lg border-2 border-white shadow-md ring-1 ring-neutral-200"
                                                    style={{ backgroundColor: preset.swatchHex }}
                                                    title={preset.name}
                                                />
                                            ))}
                                            {Object.keys(version.snapshotStateJson || {}).length > 6 && (
                                                <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-[9px] font-bold text-neutral-500 border border-neutral-200">
                                                    +{Object.keys(version.snapshotStateJson || {}).length - 6}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions - Bottom Strip */}
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100/50">
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-neutral-200 hover:bg-neutral-50"
                                                onClick={() => onCompare(version)}
                                            >
                                                Compare
                                            </Button>
                                            {isEditor && !isCurrent && (
                                                <Button
                                                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-9 rounded-xl bg-neutral-900 hover:bg-black text-white"
                                                    onClick={() => onRestore(version.id)}
                                                >
                                                    Restore
                                                </Button>
                                            )}
                                            {isEditor && !isFinal && (
                                                <Button
                                                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                                    onClick={() => onMarkFinal(version.id)}
                                                >
                                                    Finalize
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Drawer>
    );
}
