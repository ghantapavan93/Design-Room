import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { DesignRegion } from '../../lib/regions';

export interface RegionComment {
    id: string;
    region: string;
    authorName: string;
    authorRole: 'contractor' | 'homeowner';
    body: string;
    createdAt: string;
    resolvedAt?: string;
}

interface RegionCommentsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    region: string | null;
    regionLabel?: string;
    comments: RegionComment[];
    onAddComment: (region: string, body: string) => void;
    onResolveComment?: (commentId: string, resolve: boolean) => void;
    currentUserName: string;
    currentUserRole: 'contractor' | 'homeowner';
    currentPermission?: 'editor' | 'suggester' | 'viewer';
}

export function RegionCommentsDrawer({
    open,
    onOpenChange,
    region,
    regionLabel,
    comments,
    onAddComment,
    onResolveComment,
    currentUserName,
    currentUserRole,
    currentPermission = 'viewer',
}: RegionCommentsDrawerProps) {
    const [draft, setDraft] = React.useState('');
    const bottomRef = React.useRef<HTMLDivElement>(null);

    const regionComments = comments.filter(c => c.region === region);

    React.useEffect(() => {
        if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, [open, regionComments.length]);

    const handleSend = () => {
        if (!draft.trim() || !region) return;
        onAddComment(region, draft.trim());
        setDraft('');
    };

    const canResolve = (comment: RegionComment) => {
        return currentPermission === 'editor' || comment.authorName === currentUserName;
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title={regionLabel ? `Comments — ${regionLabel}` : (region ? `Comments — ${region.charAt(0).toUpperCase() + region.slice(1)}` : 'Comments')}>
            <div className="flex flex-col h-full">
                {/* Thread */}
                <div className="flex-1 overflow-y-auto space-y-4 pb-6 px-2 mt-2">
                    {regionComments.length === 0 ? (
                        <div className="text-center py-16 animate-in fade-in duration-700">
                            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 border shadow-sm" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                                <svg className="w-10 h-10" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>No feedback yet</p>
                        </div>
                    ) : (
                        regionComments.map(comment => {
                            const isMe = comment.authorName === currentUserName;
                            const roleColor = comment.authorRole === 'contractor' ? '#3b82f6' : '#f59e0b';
                            const isResolved = !!comment.resolvedAt;
                            const timeStr = (() => {
                                try {
                                    const d = new Date(comment.createdAt);
                                    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch { return ''; }
                            })();

                            return (
                                <div key={comment.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${isMe ? 'right' : 'left'}-4 duration-500`}>
                                    <div
                                        className="max-w-[85%] rounded-[2rem] px-5 py-3.5 shadow-sm transition-all hover:scale-[1.01]"
                                        style={{
                                            background: isResolved ? 'rgba(34,197,94,0.05)' : (isMe ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)'),
                                            border: `1px solid ${isResolved ? 'rgba(34,197,94,0.2)' : (isMe ? 'rgba(59,130,246,0.2)' : 'var(--border-default)')}`,
                                            opacity: isResolved ? 0.7 : 1,
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[12px] font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{comment.authorName}</span>
                                            <span
                                                className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg border shadow-sm"
                                                style={{ background: roleColor + '10', color: roleColor, borderColor: roleColor + '30' }}
                                            >
                                                {comment.authorRole}
                                            </span>
                                            {isResolved && (
                                                <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg border shadow-sm" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>
                                                    Resolved
                                                </span>
                                            )}
                                            <div className="w-1 h-1 rounded-full mx-1 opacity-20" style={{ background: 'var(--text-primary)' }} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--text-muted)' }}>{timeStr}</span>
                                        </div>
                                        <p className="text-[14px] leading-relaxed font-medium" style={{ color: 'var(--text-primary)', textDecoration: isResolved ? 'line-through' : 'none' }}>{comment.body}</p>
                                        {onResolveComment && canResolve(comment) && (
                                            <button
                                                onClick={() => onResolveComment(comment.id, !isResolved)}
                                                className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                                                style={{ color: isResolved ? '#f59e0b' : '#22c55e' }}
                                            >
                                                {isResolved ? '↩ Reopen' : '✓ Resolve'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Compose */}
                <div className="shrink-0 pt-4 pb-2 border-t mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={`Message...`}
                            className="flex-1 px-5 py-3.5 text-[13px] font-bold rounded-2xl border focus:outline-none transition-all placeholder:opacity-50"
                            style={{
                                borderColor: 'var(--border-default)',
                                background: 'transparent',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!draft.trim()}
                            className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl text-white transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
                            style={{ background: '#3b82f6' }}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7v14z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </Drawer>
    );
}

