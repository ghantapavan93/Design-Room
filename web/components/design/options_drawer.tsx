import * as React from 'react';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { DesignVersion, DesignState } from '../../lib/types';
import { formatDateTime } from '../../lib/time';

interface OptionsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    versions: DesignVersion[];
    currentState: Record<string, string>;
    finalVersionId?: string | null;
    onSaveVersion: (label: string) => void;
    onCompare: (version: DesignVersion) => void;
    onRestore: (versionId: string) => void;
    onMarkFinal: (versionId: string) => void;
    isEditor: boolean;
}

export function OptionsDrawer({
    open,
    onOpenChange,
    versions,
    currentState,
    finalVersionId,
    onSaveVersion,
    onCompare,
    onRestore,
    onMarkFinal,
    isEditor
}: OptionsDrawerProps) {
    const [newVersionLabel, setNewVersionLabel] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = () => {
        if (!newVersionLabel.trim()) return;
        setIsSaving(true);
        onSaveVersion(newVersionLabel.trim());
        setNewVersionLabel('');
        setIsSaving(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} title="Saved Versions">
            <div className="flex flex-col h-full">
                {isEditor && (
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 mb-6 shrink-0">
                        <h3 className="text-sm font-semibold mb-2">Save Current Design</h3>
                        <p className="text-xs text-neutral-500 mb-3">Save the current state as a labeled option (e.g. "Option A") to compare later.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Version Label..."
                                className="flex-1 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                                value={newVersionLabel}
                                onChange={e => setNewVersionLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                            />
                            <Button onClick={handleSave} disabled={!newVersionLabel.trim() || isSaving} className="shrink-0 h-auto py-1.5">
                                Save
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-3">
                    {versions.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm">No options saved yet.</p>
                        </div>
                    ) : (
                        versions.map((version: DesignVersion) => {
                            // Quick check if version matches current state
                            const isCurrent = JSON.stringify(version.snapshotStateJson) === JSON.stringify(currentState);
                            const isFinal = version.id === finalVersionId;

                            return (
                                <div key={version.id} className={`border rounded-lg p-4 bg-white transition-colors group relative ${isFinal ? 'border-green-300 ring-1 ring-green-300' : 'border-neutral-200 hover:border-blue-300'}`}>
                                    {isCurrent && !isFinal && (
                                        <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Current Look
                                        </div>
                                    )}
                                    {isFinal && (
                                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-green-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Final Version
                                        </div>
                                    )}
                                    <h4 className="font-semibold text-neutral-900 flex items-center gap-2">
                                        {version.label}
                                    </h4>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Saved by {version.createdBy} on {formatDateTime(version.createdAt)}
                                    </p>

                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100">
                                        <Button variant="outline" className="flex-1 text-xs h-8" onClick={() => onCompare(version)}>
                                            Compare
                                        </Button>
                                        {isEditor && !isCurrent && (
                                            <Button variant="default" className="flex-1 text-xs h-8 bg-neutral-900 text-white hover:bg-neutral-800" onClick={() => onRestore(version.id)}>
                                                Restore
                                            </Button>
                                        )}
                                        {isEditor && !isFinal && (
                                            <Button variant="default" className="flex-1 text-xs h-8 bg-green-600 text-white hover:bg-green-700" onClick={() => onMarkFinal(version.id)}>
                                                Mark Final
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Drawer>
    );
}
