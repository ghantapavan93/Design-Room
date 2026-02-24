import * as React from "react"
import { Button } from "./button"

export function Dialog({ open, onOpenChange, title, description, children }: { open: boolean, onOpenChange: (open: boolean) => void, title?: string, description?: string, children: React.ReactNode }) {
    const panelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onOpenChange(false);
            }}
        >
            <div
                ref={panelRef}
                className="rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            {title && <h2 id="dialog-title" className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>}
                            {description && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>}
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            style={{ color: 'var(--text-muted)' }}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
