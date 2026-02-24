import * as React from 'react';
import { SessionMember } from '../../lib/types';

interface LivePresenceBarProps {
    members: SessionMember[];
    isConnected: boolean;
}

const ROLE_COLORS: Record<string, string> = {
    contractor: '#6366f1',
    homeowner: '#f97316',
};

export function LivePresenceBar({ members, isConnected }: LivePresenceBarProps) {
    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    return (
        <div
            className="absolute top-4 right-5 z-20 flex items-center gap-3 px-3.5 py-2 rounded-full glass"
            style={{ boxShadow: 'var(--shadow-sm)' }}
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
                    {isConnected ? 'Live' : 'Reconnecting'}
                </span>
            </div>

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
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 cursor-default"
                                        style={{
                                            background: bg,
                                            boxShadow: '0 0 0 2px var(--bg-elevated)',
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
                                        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{member.role} · {member.permission}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {members.length === 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Waiting for others...</span>
            )}
        </div>
    );
}
