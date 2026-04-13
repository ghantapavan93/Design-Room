import * as React from 'react';
import { SessionMember } from '../../lib/types';

interface LivePresenceBarProps {
    members: SessionMember[];
    isConnected: boolean;
    onToggleChat?: () => void;
}

const ROLE_COLORS: Record<string, string> = {
    contractor: '#6366f1',
    homeowner: '#f97316',
};

export function LivePresenceBar({ members, isConnected, onToggleChat }: LivePresenceBarProps) {
    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    return (
        <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass"
            style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px) saturate(180%)',
                border: '1px solid rgba(0,0,0,0.08)'
            }}
        >
            {/* Connection indicator */}
            <div className="flex items-center gap-1.5">
                <div className="relative flex w-2.5 h-2.5">
                    {isConnected ? (
                        <>
                            <span
                                className="absolute inset-0 rounded-full animate-ping opacity-60"
                                style={{ background: 'var(--success)' }}
                            />
                            <span className="relative w-2.5 h-2.5 rounded-full" style={{ background: 'var(--success)' }} />
                        </>
                    ) : (
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--danger)' }} />
                    )}
                </div>
                <span className="text-xs font-semibold" style={{ color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
                    {isConnected ? `Live · ${Math.max(1, members.length)} in room` : 'Reconnecting...'}
                </span>
            </div>

            {/* Global Chat Toggle */}
            <div className="flex items-center ml-1">
                <button
                    onClick={onToggleChat}
                    className="p-2 rounded-lg transition-all hover:bg-black/5 hover:scale-110 active:scale-95 group/chat"
                    title="Open Project Chat"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    <svg className="w-4.5 h-4.5 group-hover/chat:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>

            <div className="w-px h-4 mx-1" style={{ background: 'var(--border-default)' }} />

            {/* Member avatars */}
            {members.length > 0 && (
                <>
                    <div className="w-px h-4" style={{ background: 'var(--border-default)' }} />
                    <div className="flex -space-x-1.5">
                        {members.map(member => {
                            const isOnline = member.lastSeenAt
                                ? (Date.now() - new Date(member.lastSeenAt).getTime()) < 30000
                                : false;
                            const bg = ROLE_COLORS[member.role] ?? '#6b7280';

                            return (
                                <div
                                    key={member.id}
                                    className="relative group"
                                    title={`${member.displayName} (${member.role})`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ring-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 shadow-inner"
                                        style={{
                                            background: bg,
                                            boxShadow: '0 0 0 2px var(--bg-elevated), 0 4px 12px rgba(0,0,0,0.3)',
                                            borderColor: 'rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        {getInitials(member.displayName)}
                                    </div>
                                    {/* Online dot */}
                                    <div
                                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1"
                                        style={{
                                            background: isOnline ? 'var(--success)' : 'var(--text-muted)',
                                            boxShadow: '0 0 0 1.5px var(--bg-elevated)',
                                        }}
                                    />
                                    {/* Tooltip */}
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded-lg px-2.5 py-1.5 whitespace-nowrap z-50"
                                        style={{
                                            background: 'var(--bg-overlay)',
                                            border: '1px solid var(--border-default)',
                                            boxShadow: 'var(--shadow-md)',
                                        }}
                                    >
                                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{member.displayName}</p>
                                        <p className="text-xs lowercase" style={{ color: 'var(--text-muted)' }}>{member.role === 'homeowner' ? 'homeowner' : 'contractor'} {member.permission === 'editor' ? 'editing' : 'viewing'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}


        </div>
    );
}
