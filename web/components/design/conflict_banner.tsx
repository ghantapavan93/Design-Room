import * as React from 'react';
import { Button } from '../ui/button';

interface ConflictBannerProps {
    message: string;
    onKeepMine: () => void;
    onKeepTheirs: () => void;
    show: boolean;
}

export function ConflictBanner({ message, onKeepMine, onKeepTheirs, show }: ConflictBannerProps) {
    if (!show) return null;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-red-200 shadow-xl rounded-lg p-4 w-full max-w-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="flex-1 pt-1">
                    <h3 className="text-sm font-semibold text-neutral-900">Edit Conflict Detected</h3>
                    <p className="text-sm text-neutral-600 mt-1 leading-snug">{message}</p>
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3 mt-1">
                <Button variant="outline" className="text-xs h-8" onClick={onKeepTheirs}>
                    Keep Theirs (Refresh)
                </Button>
                <Button className="text-xs h-8 bg-neutral-900 text-white" onClick={onKeepMine}>
                    Keep Mine (Overwrite)
                </Button>
            </div>
        </div>
    );
}
