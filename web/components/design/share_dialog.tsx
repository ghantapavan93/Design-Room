import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from '../ui/toast';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shareLink: string | null;
    isLoading: boolean;
    onCreateLink: (mode: 'live' | 'view', permission: 'suggester' | 'viewer') => void;
}

export function ShareDialog({ open, onOpenChange, shareLink, isLoading, onCreateLink }: ShareDialogProps) {
    const [mode, setMode] = React.useState<'live' | 'view'>('live');
    const [permission, setPermission] = React.useState<'suggester' | 'viewer'>('suggester');

    React.useEffect(() => {
        if (open) {
            onCreateLink(mode, mode === 'live' ? permission : 'viewer');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, permission]);

    const handleCopy = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            toast({ title: 'Link copied to clipboard', variant: 'success' });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="Share Design Room"
            description="Invite homeowners or contractors to review and collaborate."
        >
            <div className="mt-4 space-y-4 text-sm" style={{ color: 'var(--text-primary)' }}>

                <div className="space-y-2">
                    <label className="font-medium text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Share Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        <label
                            className="border rounded-xl p-3 cursor-pointer flex flex-col gap-1 transition-all"
                            style={{
                                borderColor: mode === 'live' ? '#60a5fa' : 'var(--border-subtle)',
                                background: mode === 'live' ? 'rgba(96,165,250,0.1)' : 'transparent',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <input type="radio" name="mode" className="text-blue-500" checked={mode === 'live'} onChange={() => setMode('live')} />
                                <span className="font-semibold text-sm">Live Room</span>
                            </div>
                            <span className="text-xs ml-6" style={{ color: 'var(--text-muted)' }}>Real-time collaboration with presence.</span>
                        </label>
                        <label
                            className="border rounded-xl p-3 cursor-pointer flex flex-col gap-1 transition-all"
                            style={{
                                borderColor: mode === 'view' ? '#60a5fa' : 'var(--border-subtle)',
                                background: mode === 'view' ? 'rgba(96,165,250,0.1)' : 'transparent',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <input type="radio" name="mode" className="text-blue-500" checked={mode === 'view'} onChange={() => setMode('view')} />
                                <span className="font-semibold text-sm">View Only</span>
                            </div>
                            <span className="text-xs ml-6" style={{ color: 'var(--text-muted)' }}>For final handoffs. Cannot be edited.</span>
                        </label>
                    </div>
                </div>

                {mode === 'live' && (
                    <div className="space-y-2 pt-2">
                        <label className="font-medium text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Permissions</label>
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value as any)}
                            className="w-full rounded-lg p-2.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        >
                            <option value="suggester">Can Suggest (Homeowner)</option>
                            <option value="editor">Can Edit & Approve (Contractor)</option>
                            <option value="viewer">Can View</option>
                        </select>
                        <p className="text-xs italic mt-1" style={{ color: 'var(--text-muted)' }}>
                            {permission === 'suggester' ? '"Can Suggest" allows the user to propose changes that you must approve.' : '"Can Edit" grants full control over the design.'}
                        </p>
                    </div>
                )}

                <div className="pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <div className="spinner" style={{ borderColor: 'var(--text-muted)', borderTopColor: 'var(--text-primary)' }} />
                        </div>
                    ) : shareLink ? (
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Secure Link</label>
                            <div className="flex gap-2 items-center p-2 rounded-lg transition-all" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                                <input
                                    type="text"
                                    readOnly
                                    value={shareLink}
                                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-2"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                    style={{ color: 'var(--text-primary)' }}
                                />
                                <button
                                    onClick={handleCopy}
                                    className="shrink-0 px-4 py-1.5 rounded-md text-xs font-semibold transition-all hover:opacity-80"
                                    style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {mode === 'view' && (
                        <div className="mt-2 p-4 rounded-xl flex items-center justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <div>
                                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Export Design Pack</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Download all angles and specs as .zip</p>
                            </div>
                            <button
                                className="px-4 py-2 rounded-md text-xs font-semibold"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)' }}
                            >
                                Generate
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
