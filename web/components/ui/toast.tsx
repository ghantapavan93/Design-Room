import * as React from "react"
import { createRoot } from "react-dom/client"

export type ToastProps = {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
}

function ToastComponent({ title, description, variant = 'default', onClose }: ToastProps & { onClose: () => void }) {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = variant === 'destructive' ? 'bg-red-600 text-white' :
        variant === 'success' ? 'bg-green-600 text-white' :
            'bg-white text-neutral-950 border border-neutral-200';

    return (
        <div className={`${bgClass} rounded-md shadow-lg p-4 max-w-sm mb-2 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto flex items-start justify-between`}>
            <div className="flex flex-col gap-1 pr-4">
                <h3 className="text-sm font-medium">{title}</h3>
                {description && <p className="text-sm opacity-90">{description}</p>}
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="Close toast">&times;</button>
        </div>
    )
}

let toastRoot: ReturnType<typeof createRoot> | null = null;
const toasts: (ToastProps & { id: string })[] = [];

function renderToasts() {
    if (typeof window === 'undefined') return;

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none';
        document.body.appendChild(container);
        toastRoot = createRoot(container);
    }

    if (toastRoot) {
        toastRoot.render(
            <>
                {toasts.map(t => (
                    <ToastComponent
                        key={t.id}
                        {...t}
                        onClose={() => {
                            const idx = toasts.findIndex(x => x.id === t.id);
                            if (idx !== -1) {
                                toasts.splice(idx, 1);
                                renderToasts();
                            }
                        }}
                    />
                ))}
            </>
        );
    }
}

export function toast(props: ToastProps) {
    const id = Math.random().toString(36).substring(2, 9);
    toasts.push({ ...props, id });
    renderToasts();
}
