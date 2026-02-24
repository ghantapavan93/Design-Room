import * as React from 'react';

interface EditorShellProps {
    children: React.ReactNode;
}

export function EditorShell({ children }: EditorShellProps) {
    return (
        <div
            className="h-screen w-full flex flex-col overflow-hidden font-sans"
            style={{ background: 'var(--bg-base)' }}
        >
            {children}
        </div>
    );
}
