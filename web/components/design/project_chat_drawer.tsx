import * as React from 'react';
import { Drawer } from '../ui/drawer';

export interface ProjectMessage {
    id: string;
    authorName: string;
    authorRole: 'contractor' | 'homeowner';
    body: string;
    createdAt: string;
}

interface ProjectChatDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    messages: ProjectMessage[];
    onAddMessage: (body: string) => void;
    currentUserName: string;
    currentUserRole: 'contractor' | 'homeowner';
    currentPermission?: 'editor' | 'suggester' | 'viewer';
}

export function ProjectChatDrawer({
    open,
    onOpenChange,
    messages,
    onAddMessage,
    currentUserName,
    currentUserRole,
    currentPermission = 'editor',
}: ProjectChatDrawerProps) {
    const [draft, setDraft] = React.useState('');
    const bottomRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, [open, messages.length]);

    const handleSend = () => {
        if (!draft.trim()) return;
        onAddMessage(draft.trim());
        setDraft('');
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Project Chat">
            <div className="flex flex-col h-full">
                {/* Thread */}
                <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-2 mt-2">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-10 h-10 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No project messages yet.</p>
                            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--text-muted)' }}>Start the conversation below.</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.authorName === currentUserName;
                            const roleColor = msg.authorRole === 'contractor' ? '#3b82f6' : '#f59e0b';
                            const timeStr = (() => {
                                try {
                                    const d = new Date(msg.createdAt);
                                    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch {
                                    return '';
                                }
                            })();

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                                    <div
                                        className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all group/msg"
                                        style={{
                                            background: isMe ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
                                            border: `1px solid ${isMe ? 'rgba(59,130,246,0.2)' : 'var(--border-default)'}`
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[12px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{msg.authorName}</span>
                                            <span
                                                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                                                style={{ background: roleColor + '15', color: roleColor, border: `1px solid ${roleColor}25` }}
                                            >
                                                {msg.authorRole}
                                            </span>
                                            <span className="text-[10px] ml-auto tabular-nums opacity-60 group-hover/msg:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>{timeStr}</span>
                                        </div>
                                        <p className="text-[14px] leading-[1.6] font-medium tracking-tight whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{msg.body}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Compose — hidden for viewers */}
                {currentPermission === 'viewer' ? (
                    <div
                        className="shrink-0 pt-4 pb-2 border-t flex items-center justify-center gap-2"
                        style={{ borderColor: 'var(--border-subtle)' }}
                    >
                        <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>View only — participants cannot post messages</p>
                    </div>
                ) : (
                <div className="shrink-0 pt-4 pb-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={`Message the room as ${currentUserName}\u2026`}
                            className="flex-1 px-4 py-3 text-sm font-medium rounded-xl border focus:outline-none transition-all placeholder:opacity-50"
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
                            className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
                            style={{ background: '#3b82f6' }}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
                )}
            </div>
        </Drawer>
    );
}
