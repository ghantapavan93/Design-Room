import * as React from 'react';
import { Drawer } from '../ui/drawer';
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
    onUnlockDesign?: () => void;
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
    onUnlockDesign,
    isEditor
}: OptionsDrawerProps) {
    const [newVersionLabel, setNewVersionLabel] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nextLetter = versions.length < letters.length ? letters[versions.length] : String(versions.length + 1);
        const suggested = `Option ${nextLetter}`;
        if (!newVersionLabel || newVersionLabel.startsWith('Option ')) {
            setNewVersionLabel(suggested);
        }
    }, [versions.length]);

    const handleSave = async () => {
        if (!newVersionLabel.trim() || isSaving) return;
        setIsSaving(true);
        try { await onSaveVersion(newVersionLabel.trim()); }
        catch (err) { console.error('Save failed:', err); }
        finally { setIsSaving(false); }
    };

    const versionEstimates = React.useMemo(() =>
        versions.map(v => ({
            id: v.id,
            estimate: computeEstimate((v.snapshotStateJson || {}) as Record<string, string>, presetsMap, MOCK_MEASUREMENTS).total,
        })), [versions, presetsMap]);

    const minEstimate = versionEstimates.length > 0 ? Math.min(...versionEstimates.map(v => v.estimate)) : 0;

    const versionQualityScores = React.useMemo(() =>
        versions.map(v => {
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
        }), [versions, presetsMap]);

    const maxQualityScore = versionQualityScores.length > 0 ? Math.max(...versionQualityScores.map(v => v.score)) : 0;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Saved Options">
            <div className="flex flex-col h-full gap-4">

                {/* ── Save current design ─────────────────────────────── */}
                {isEditor && (
                    <div
                        className="shrink-0 rounded-2xl p-4"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.10)',
                        }}
                    >
                        <p className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest mb-1">
                            Save Current Design
                        </p>
                        <p className="text-xs text-neutral-500 mb-3">
                            Snapshot the current state as a named option to compare later.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Option label..."
                                className="flex-1 px-3 py-2 text-sm rounded-xl outline-none"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: '#fff',
                                }}
                                value={newVersionLabel}
                                onChange={e => setNewVersionLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                            />
                            <button
                                onClick={handleSave}
                                disabled={!newVersionLabel.trim() || isSaving}
                                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
                                style={{ background: '#fff', color: '#000' }}
                            >
                                {isSaving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Version list ────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
                    {versions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg className="w-10 h-10 mb-4 opacity-20 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm font-semibold text-neutral-500">No options saved yet.</p>
                            <p className="text-xs text-neutral-600 mt-1">Apply materials and save a snapshot above.</p>
                        </div>
                    ) : (
                        versions.map((version: DesignVersion) => {
                            const isCurrent = JSON.stringify(version.snapshotStateJson || {}) === JSON.stringify(currentState);
                            const isFinal = String(version.id) === String(finalVersionId);
                            const estimate = versionEstimates.find(v => v.id === version.id)?.estimate ?? 0;
                            const isBestValue = estimate === minEstimate && versionEstimates.length > 1;
                            const qualityScore = versionQualityScores.find(v => v.id === version.id)?.score ?? 0;
                            const isRecommended = qualityScore === maxQualityScore && versionQualityScores.length > 1 && !isFinal;

                            const swatches = Object.values(version.snapshotStateJson || {})
                                .map(matId => presetsMap[matId as string])
                                .filter(Boolean)
                                .slice(0, 6);

                            return (
                                <div
                                    key={version.id}
                                    className="rounded-2xl overflow-hidden"
                                    style={{
                                        background: isFinal
                                            ? 'rgba(16,185,129,0.08)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: isFinal
                                            ? '1px solid rgba(16,185,129,0.35)'
                                            : '1px solid rgba(255,255,255,0.10)',
                                    }}
                                >
                                    {/* Card body */}
                                    <div className="p-4">
                                        {/* Badges row */}
                                        {(isFinal || isRecommended || isBestValue || isCurrent) && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {isFinal && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                        style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.35)' }}>
                                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Final Selection
                                                    </span>
                                                )}
                                                {isRecommended && !isFinal && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                                                        ⭐ Recommended
                                                    </span>
                                                )}
                                                {isBestValue && !isFinal && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                        style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                                                        Best Value
                                                    </span>
                                                )}
                                                {isCurrent && !isFinal && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                                        style={{ background: 'rgba(255,255,255,0.08)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.15)' }}>
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Title + Estimate */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="text-sm font-extrabold text-white tracking-tight">{version.label}</h4>
                                                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
                                                    {version.createdBy} · {formatDateTime(version.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Est.</p>
                                                <p className="text-sm font-black text-white mt-0.5">${Math.round(estimate).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Swatches */}
                                        {swatches.length > 0 && (
                                            <div className="flex items-center gap-1.5 mt-3">
                                                {swatches.map((preset, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-5 h-5 rounded-md shrink-0"
                                                        style={{
                                                            backgroundColor: preset.swatchHex,
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                                        }}
                                                        title={preset.name}
                                                    />
                                                ))}
                                                {Object.keys(version.snapshotStateJson || {}).length > 6 && (
                                                    <span className="text-[9px] font-bold text-neutral-500 ml-1">
                                                        +{Object.keys(version.snapshotStateJson || {}).length - 6}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action strip */}
                                    <div
                                        className="flex items-center gap-2 px-4 py-3"
                                        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                                    >
                                        {/* Compare — always visible */}
                                        <button
                                            onClick={() => onCompare(version)}
                                            className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                            style={{
                                                background: 'rgba(255,255,255,0.07)',
                                                color: '#d1d5db',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                            }}
                                        >
                                            Compare
                                        </button>

                                        {/* Restore — editor, not current */}
                                        {isEditor && !isCurrent && (
                                            <button
                                                onClick={() => onRestore(version.id)}
                                                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                                style={{
                                                    background: 'rgba(255,255,255,0.10)',
                                                    color: '#fff',
                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                }}
                                            >
                                                Restore
                                            </button>
                                        )}

                                        {/* Finalize — editor, not yet final */}
                                        {isEditor && !isFinal && (
                                            <button
                                                onClick={() => onMarkFinal(version.id)}
                                                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                                style={{
                                                    background: 'rgba(52,211,153,0.15)',
                                                    color: '#34d399',
                                                    border: '1px solid rgba(52,211,153,0.3)',
                                                }}
                                            >
                                                Finalize
                                            </button>
                                        )}

                                        {/* Unlock — if already final */}
                                        {isEditor && isFinal && onUnlockDesign && (
                                            <button
                                                onClick={onUnlockDesign}
                                                className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                                style={{
                                                    background: 'rgba(239,68,68,0.10)',
                                                    color: '#f87171',
                                                    border: '1px solid rgba(239,68,68,0.25)',
                                                }}
                                            >
                                                Unlock
                                            </button>
                                        )}
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
