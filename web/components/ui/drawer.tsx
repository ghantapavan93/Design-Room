import * as React from "react"

export function Drawer({ open, onOpenChange, side = 'right', title, panelClassName, contentClassName, children }: { open: boolean, onOpenChange: (open: boolean) => void, side?: 'left' | 'right', title?: string, panelClassName?: string, contentClassName?: string, children: React.ReactNode }) {
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

    const sideClass = side === 'right' ? 'right-0 border-l border-white/10' : 'left-0 border-r border-white/10';
    const slideClass = side === 'right' ? 'slide-in-from-right' : 'slide-in-from-left';

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" aria-hidden="true" onClick={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
        }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity pointer-events-none" />

            <div
                className={`relative inset-y-0 ${sideClass} z-[110] w-full ${panelClassName || 'sm:w-[420px]'} bg-[#0f0f12]/90 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in ${slideClass} fade-in duration-300 ease-out flex flex-col`}
                role="dialog"
                aria-modal="true"
            >
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
                    <h2 className="text-sm font-black tracking-widest uppercase text-white">{title}</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Close drawer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className={`flex-1 ${contentClassName || 'overflow-y-auto p-6 text-neutral-300'}`}>
                    {children}
                </div>
            </div>
        </div>
    )
}
