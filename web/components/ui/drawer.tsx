import * as React from "react"

export function Drawer({ open, onOpenChange, side = 'right', title, children }: { open: boolean, onOpenChange: (open: boolean) => void, side?: 'left' | 'right', title?: string, children: React.ReactNode }) {
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

    const sideClass = side === 'right' ? 'right-0 border-l border-neutral-200' : 'left-0 border-r border-neutral-200';
    const slideClass = side === 'right' ? 'slide-in-from-right' : 'slide-in-from-left';

    return (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20" aria-hidden="true" onClick={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
        }}>
            <div
                className={`fixed inset-y-0 ${sideClass} z-50 w-full max-w-sm bg-white shadow-xl animate-in ${slideClass} duration-300 flex flex-col`}
                role="dialog"
                aria-modal="true"
            >
                <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 shrink-0">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-neutral-500 hover:text-neutral-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-950"
                        aria-label="Close drawer"
                    >
                        &times;
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
