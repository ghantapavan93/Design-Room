import * as React from 'react';
import { Button } from '../ui/button';
import { MaterialPreset } from '../../lib/types';

interface ConflictBannerProps {
    message: string;
    onKeepMine: () => void;
    onKeepTheirs: () => void;
    show: boolean;
    conflictRegion?: string;
    myMaterial?: MaterialPreset;
    theirMaterial?: MaterialPreset;
    errorCode?: string;
}

function MaterialCard({ label, preset, accent }: { label: string; preset?: MaterialPreset; accent: string }) {
    if (!preset) return null;
    return (
        <div className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/5 transition-all">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 opacity-50" style={{ color: accent }}>{label}</p>
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-xl shadow-2xl shrink-0 border-2 border-white/10 group-hover:scale-105 transition-transform"
                    style={{
                        backgroundColor: preset.swatchHex,
                        backgroundImage: preset.thumbnailUrl ? `url(${preset.thumbnailUrl})` : 'none',
                        backgroundSize: 'cover'
                    }}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate uppercase tracking-tight">{preset.name}</p>
                    <p className="text-[10px] font-bold text-white/40 truncate uppercase tracking-widest">{preset.brand}</p>
                    {preset.costBand && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">{preset.costBand}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ConflictBanner({ message, onKeepMine, onKeepTheirs, show, conflictRegion, myMaterial, theirMaterial, errorCode }: ConflictBannerProps) {
    if (!show) return null;

    const isLocked = errorCode === 'LOCKED';
    const isStale = errorCode === 'STALE_VERSION';
    const hasSwatches = isStale && (myMaterial || theirMaterial);

    return (
        <div
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl animate-in fade-in slide-in-from-top-8 duration-500 ease-out"
        >
            <div className="mx-4 overflow-hidden rounded-3xl border border-white/20 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] bg-slate-900/80 backdrop-blur-2xl">
                {/* Header Strip */}
                <div className="bg-red-500/10 border-b border-red-500/10 px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {isLocked ? 'Region Locked' : 'Conflict Detected'}
                            </h3>
                            {conflictRegion && (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/20 uppercase tracking-widest">
                                    {conflictRegion}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] font-bold text-white/50 mt-0.5">{message}</p>
                    </div>
                </div>

                {/* Integrated Comparison */}
                {hasSwatches && (
                    <div className="p-6 flex items-stretch gap-4 bg-gradient-to-b from-white/5 to-transparent">
                        <MaterialCard label="Keep Mine" preset={myMaterial} accent="#3b82f6" />
                        <div className="flex flex-col items-center justify-center gap-2 px-2">
                            <div className="w-px flex-1 bg-white/10" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">VS</span>
                            <div className="w-px flex-1 bg-white/10" />
                        </div>
                        <MaterialCard label="Keep Theirs" preset={theirMaterial} accent="#f59e0b" />
                    </div>
                )}

                {/* Actions Strip */}
                <div className="px-6 py-4 bg-black/40 flex justify-end gap-3 border-t border-white/5">
                    {isLocked ? (
                        <button
                            onClick={onKeepMine} // Parent passes the clear-state handler here for LOCKED
                            className="px-6 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-700 text-white shadow-lg hover:bg-slate-600 active:scale-95 transition-all"
                        >
                            Got it
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onKeepTheirs}
                                className="px-5 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-all"
                            >
                                Accept Incoming
                            </button>
                            <button
                                onClick={onKeepMine}
                                className="px-6 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400 active:scale-95 transition-all"
                            >
                                Keep My Version
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
