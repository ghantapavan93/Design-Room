import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { toast } from '../ui/toast';
import { ShareLink } from '../../lib/types';
import { formatTimeAgo } from '../../lib/time';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shareLink: string | null;
    isLoading: boolean;
    onCreateLink: (mode: 'live' | 'view', permission: 'editor' | 'suggester' | 'viewer') => Promise<void> | void;
    activeLinks?: ShareLink[];
    onRevokeLink?: (linkId: string) => Promise<void> | void;
}

export function ShareDialog({ open, onOpenChange, shareLink, isLoading, onCreateLink, activeLinks = [], onRevokeLink }: ShareDialogProps) {
    const [mode, setMode] = React.useState<'live' | 'view'>('live');
    const [permission, setPermission] = React.useState<'editor' | 'suggester' | 'viewer'>('suggester');

    // Per-link state for "Copied" and "Revoked" button feedback
    const [copiedIds, setCopiedIds] = React.useState<Set<string>>(new Set());
    const [revokedIds, setRevokedIds] = React.useState<Set<string>>(new Set());
    // For the newly-generated link copy button
    const [newLinkCopied, setNewLinkCopied] = React.useState(false);

    // Reset per-link state when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setCopiedIds(new Set());
            setRevokedIds(new Set());
            setNewLinkCopied(false);
        }
    }, [open]);

    const handleCopy = (linkStr: string, linkId?: string) => {
        navigator.clipboard.writeText(linkStr).catch(() => {
            // Fallback for older browsers
            const el = document.createElement('textarea');
            el.value = linkStr;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        });
        if (linkId) {
            setCopiedIds(prev => new Set(prev).add(linkId));
            // Reset after 2s
            setTimeout(() => {
                setCopiedIds(prev => {
                    const next = new Set(prev);
                    next.delete(linkId);
                    return next;
                });
            }, 2000);
        } else {
            setNewLinkCopied(true);
            setTimeout(() => setNewLinkCopied(false), 2000);
        }
        toast({ title: 'Link copied to clipboard', variant: 'success' });
    };

    const handleRevoke = async (linkId: string) => {
        // Optimistically mark as revoked immediately
        setRevokedIds(prev => new Set(prev).add(linkId));
        await onRevokeLink?.(linkId);
    };

    // Filter: only show active (not revoked, not expired) links
    // Sort by createdAt descending so newest is always on top
    const validLinks = (activeLinks || [])
        .filter(l => {
            if (!l || !l.token) return false;
            if (!!l.revokedAt) return false;
            if (revokedIds.has(l.id)) return false; // optimistic hide
            if (l.expiresAt && new Date(l.expiresAt) <= new Date()) return false;
            return true;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            title="Invite Collaborators"
        >
            <p className="text-[10px] font-medium px-5 -mt-1 mb-6 opacity-50 tracking-wide text-neutral-400">Generate a secure link to share your live session or a static snapshot.</p>
            <div className="px-5 pb-8 space-y-8">
                {/* Access Channel */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Access Channel</label>
                    <div className="grid grid-cols-2 gap-3">
                        <label
                            className="group border rounded-2xl p-4 cursor-pointer flex flex-col gap-2 transition-all hover:scale-[1.02] shadow-2xl relative overflow-hidden"
                            style={{
                                borderColor: mode === 'live' ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.06)',
                                background: mode === 'live' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <input type="radio" name="mode" className="text-blue-500 bg-transparent" style={{ borderColor: 'var(--border-default)' }} checked={mode === 'live'} onChange={() => setMode('live')} />
                                <span className="font-black text-xs uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Live Room</span>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-widest pl-6">Real-time sync · Active presence</span>
                        </label>
                        <label
                            className="group border rounded-2xl p-4 cursor-pointer flex flex-col gap-2 transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden"
                            style={{
                                borderColor: mode === 'view' ? 'rgba(59,130,246,0.5)' : 'var(--border-subtle)',
                                background: mode === 'view' ? 'rgba(59,130,246,0.05)' : 'var(--bg-hover)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <input type="radio" name="mode" className="text-blue-500 bg-transparent" style={{ borderColor: 'var(--border-default)' }} checked={mode === 'view'} onChange={() => setMode('view')} />
                                <span className="font-black text-xs uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Snapshot</span>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-widest pl-6">View only · Final handoff</span>
                        </label>
                    </div>
                </div>

                {/* Role selector */}
                {mode === 'live' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Collaborator Role</label>
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value as any)}
                            className="w-full rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest appearance-none focus:outline-none ring-1 transition-all shadow-sm"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <option value="suggester">Homeowner (Suggester)</option>
                            <option value="editor">Contractor (Editor)</option>
                            <option value="viewer">Guest (Viewer)</option>
                        </select>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed mt-2 px-1">
                            {permission === 'suggester' && 'Proposals undergo contractor approval.'}
                            {permission === 'editor' && 'Full design and administrative access granted.'}
                            {permission === 'viewer' && 'Read-only access. Cannot propose or edit.'}
                        </p>
                    </div>
                )}

                {/* Generate Button + new link display */}
                <div className="pt-2 flex flex-col gap-3">
                    <button
                        onClick={() => onCreateLink(mode, mode === 'live' ? permission : 'viewer')}
                        disabled={isLoading}
                        className="w-full px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-md flex justify-center items-center h-12"
                        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                    >
                        {isLoading
                            ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                            : '+ Generate Link'}
                    </button>

                    {shareLink && !isLoading && (
                        <div
                            className="flex gap-2 items-center rounded-xl p-3 border animate-in fade-in slide-in-from-top-2 duration-300"
                            style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.25)' }}
                        >
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-transparent border-none text-[10px] font-mono focus:ring-0 text-emerald-700 dark:text-emerald-300 overflow-x-auto"
                            />
                            <button
                                onClick={() => handleCopy(shareLink)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                                style={{
                                    background: newLinkCopied ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                                    color: newLinkCopied ? '#16a34a' : '#16a34a',
                                    border: '1px solid rgba(34,197,94,0.3)'
                                }}
                            >
                                {newLinkCopied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Active Links list — newest first, expired/revoked hidden */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-3 block">
                        Active Links
                        {validLinks.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[9px]">
                                {validLinks.length}
                            </span>
                        )}
                    </label>

                    {validLinks.length > 0 ? (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {validLinks.map(link => {
                                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                                const fullUrl = `${origin}/design/${link.mode}/${link.token}`;
                                const isCopied = copiedIds.has(link.id);
                                const isRevoked = revokedIds.has(link.id);
                                const labelColor = link.mode === 'view'
                                    ? { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' }
                                    : link.permission === 'editor'
                                        ? { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' }
                                        : { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
                                return (
                                    <div
                                        key={link.id}
                                        className="p-3 rounded-xl border flex flex-col gap-2 transition-all"
                                        style={{
                                            background: 'var(--bg-elevated)',
                                            borderColor: 'var(--border-subtle)',
                                            opacity: isRevoked ? 0.5 : 1
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${labelColor.bg} ${labelColor.text} ${labelColor.border}`}>
                                                    {link.mode === 'view' ? 'Snap' : (link.permission || 'live')}
                                                </span>
                                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                    {formatTimeAgo(link.createdAt)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => !isRevoked && handleRevoke(link.id)}
                                                disabled={isRevoked}
                                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all"
                                                style={{
                                                    color: isRevoked ? 'var(--text-muted)' : '#ef4444',
                                                    cursor: isRevoked ? 'default' : 'pointer'
                                                }}
                                            >
                                                {isRevoked ? '✓ Revoked' : 'Revoke'}
                                            </button>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span
                                                className="flex-1 text-[10px] font-mono tracking-tight truncate"
                                                style={{ color: 'var(--text-muted)' }}
                                                title={fullUrl}
                                            >
                                                {fullUrl}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(fullUrl, link.id)}
                                                className="text-[10px] font-black uppercase tracking-wider shrink-0 px-2 py-1 rounded transition-all"
                                                style={{
                                                    color: isCopied ? '#16a34a' : 'var(--text-muted)',
                                                    background: isCopied ? 'rgba(34,197,94,0.08)' : 'transparent'
                                                }}
                                            >
                                                {isCopied ? '✓ Copied' : 'Copy'}
                                            </button>
                                        </div>
                                        {link.lastAccessedAt && (
                                            <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                                Last accessed: {formatTimeAgo(link.lastAccessedAt)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-6 text-center rounded-xl border border-dashed" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-base)' }}>
                            <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                No active share links
                            </p>
                            <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                                Generate a link above to invite collaborators
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    );
}
