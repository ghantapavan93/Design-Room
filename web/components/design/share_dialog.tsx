import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { toast } from '../ui/toast';
import { ShareLink } from '../../lib/types';
import { formatTimeAgo } from '../../lib/time';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shareLink: string | null;
    isLoading: boolean;
    onCreateLink: (mode: 'live' | 'view', permission: 'editor' | 'suggester' | 'viewer') => void;
    activeLinks?: ShareLink[];
    onRevokeLink?: (linkId: string) => void;
}

export function ShareDialog({ open, onOpenChange, shareLink, isLoading, onCreateLink, activeLinks = [], onRevokeLink }: ShareDialogProps) {
    const [mode, setMode] = React.useState<'live' | 'view'>('live');
    const [permission, setPermission] = React.useState<'editor' | 'suggester' | 'viewer'>('suggester');

    React.useEffect(() => {
        if (open && shareLink === null) {
            // Optional auto-create link behavior can be managed by parent or here if needed
        }
    }, [open, shareLink]);

    const handleCopy = (linkStr: string) => {
        navigator.clipboard.writeText(linkStr);
        toast({ title: 'Link copied to clipboard', variant: 'success' });
    };

    const validLinks = activeLinks.filter(l => !l.revokedAt);

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="Invite Collaborators"
            description="Generate a secure link to share your live session or a static snapshot."
        >
            <div className="mt-8 space-y-8" style={{ color: 'var(--text-secondary)' }}>
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

                <div className="pt-2 flex flex-col gap-4">
                    <button
                        onClick={() => onCreateLink(mode, mode === 'live' ? permission : 'viewer')}
                        disabled={isLoading}
                        className="w-full px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-md flex justify-center items-center h-12"
                        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                    >
                        {isLoading ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" /> : 'Generate Link'}
                    </button>
                    {shareLink && !isLoading && (
                        <div className="flex gap-2 mt-2 items-center">
                           <input type="text" readOnly value={shareLink} className="flex-1 rounded-lg text-xs px-3 bg-neutral-100 py-3 dark:bg-neutral-800 font-mono overflow-x-auto" />
                           <button onClick={() => handleCopy(shareLink)} className="px-5 rounded-lg text-white bg-blue-600 text-xs py-3 whitespace-nowrap font-bold hover:bg-blue-700 active:scale-95 transition-all">Copy</button>
                        </div>
                    )}
                </div>

                {validLinks.length > 0 && (
                    <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-4 block">Active Links</label>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {validLinks.map(link => {
                                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                                const fullUrl = `${origin}/design/${link.mode}/${link.token}`;
                                return (
                                <div key={link.id} className="p-3 rounded-xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
                                                {link.mode === 'live' ? link.permission : 'Snap'}
                                            </span>
                                            <span className="text-[10px] text-neutral-500">{formatTimeAgo(link.createdAt)}</span>
                                        </div>
                                        <button 
                                            onClick={() => onRevokeLink?.(link.id)}
                                            className="text-[10px] text-red-500 hover:text-red-600 px-2 font-bold uppercase tracking-wider"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={fullUrl} className="flex-1 bg-transparent border-none text-[10px] font-mono tracking-widest p-0 focus:ring-0 text-neutral-800 dark:text-neutral-200" />
                                        <button onClick={() => handleCopy(fullUrl)} className="text-[10px] text-neutral-500 hover:text-neutral-800 font-bold uppercase shrink-0">Copy</button>
                                    </div>
                                    {link.lastAccessedAt && (
                                        <span className="text-[9px] text-neutral-400 font-bold">Last accessed: {formatTimeAgo(link.lastAccessedAt)}</span>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
}
