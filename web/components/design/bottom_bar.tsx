import * as React from 'react';
import { DesignRegion } from '../../lib/regions';

interface BottomBarProps {
    mode: 'design' | 'compare';
    onModeChange: (mode: 'design' | 'compare') => void;
    onOpenLedger: () => void;
    onOpenVersions: () => void;
    onOpenTakeoff: () => void;
    onShare: () => void;
    onUndo: () => void;
    canUndo: boolean;
    statusText: string;
}

export function BottomBar({
    mode,
    onModeChange,
    onOpenLedger,
    onOpenVersions,
    onOpenTakeoff,
    onShare,
    onUndo,
    canUndo,
    statusText
}: BottomBarProps) {
    return (
        <div
            className="h-14 px-6 flex items-center justify-between shrink-0 z-20 relative"
            style={{
                background: 'var(--bg-elevated)',
                borderTop: '1px solid var(--border-subtle)',
            }}
        >
            {/* Left: undo + status */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo last change"
                    className="p-2 rounded-lg transition-all"
                    style={{
                        color: canUndo ? 'var(--text-secondary)' : 'var(--text-muted)',
                        background: 'transparent',
                        opacity: canUndo ? 1 : 0.35,
                    }}
                    onMouseOver={e => canUndo && (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                </button>

                <div className="w-px h-4 mx-1" style={{ background: 'var(--border-subtle)' }} />

                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                    {statusText}
                </div>
            </div>

            {/* Right: History / Versions / Share */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onOpenLedger}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                </button>

                <button
                    onClick={onOpenVersions}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Options
                </button>

                <div className="w-px h-4 mx-1" style={{ background: 'var(--border-subtle)' }} />

                <button
                    onClick={onOpenTakeoff}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Takeoff & Estimate
                </button>

                <div className="w-px h-4 mx-1" style={{ background: 'var(--border-subtle)' }} />

                <button
                    onClick={onShare}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.657 3.232m-5.657-8.602l5.657-3.232m5.657 3.232a3 3 0 110-5.368 3 3 0 010 5.368zm0 8.602a3 3 0 110-5.368 3 3 0 010 5.368z" />
                    </svg>
                    Share Live Room
                </button>
            </div>
        </div>
    );
}
