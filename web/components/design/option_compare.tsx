import * as React from 'react';
import { DesignVersion, MaterialPreset } from '../../lib/types';
import { DesignRegion } from '../../lib/regions';
import { PreviewCanvas } from './preview_canvas';
import { Button } from '../ui/button';

interface OptionCompareProps {
    version: DesignVersion;
    currentState: Record<DesignRegion, string>;
    presetsMap: Record<string, MaterialPreset>;
    baseImageUrl: string;
    masksUrlPrefix: string;
    onClose: () => void;
    onRestore: (versionId: string) => void;
    isEditor: boolean;
}

export function OptionCompare({
    version,
    currentState,
    presetsMap,
    baseImageUrl,
    masksUrlPrefix,
    onClose,
    onRestore,
    isEditor
}: OptionCompareProps) {
    return (
        <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col animate-in fade-in duration-300">
            <div className="h-16 border-b border-neutral-700 px-6 flex items-center justify-between shrink-0 bg-neutral-900 text-white">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold">Comparing Options</h2>
                        <p className="text-xs text-neutral-400">Current Work vs. {version.label}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="text-white border-neutral-600 hover:bg-neutral-800" onClick={onClose}>
                        Cancel
                    </Button>
                    {isEditor && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0" onClick={() => onRestore(version.id)}>
                            Restore {version.label}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Current State */}
                <div className="flex-1 border-r border-neutral-700 flex flex-col">
                    <div className="h-12 bg-neutral-800/50 flex items-center justify-center border-b border-neutral-700 shrink-0">
                        <span className="text-sm font-medium text-white px-3 py-1 bg-neutral-700 rounded-full">Current Design</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            selectedMaterials={currentState}
                            presetsMap={presetsMap}
                            selectedRegions={[]}
                        />
                    </div>
                </div>

                {/* Right Side: Version State */}
                <div className="flex-1 flex flex-col">
                    <div className="h-12 bg-neutral-800/50 flex items-center justify-center border-b border-neutral-700 shrink-0">
                        <span className="text-sm font-medium text-blue-200 px-3 py-1 bg-blue-900/50 rounded-full">{version.label}</span>
                    </div>
                    <div className="flex-1 relative">
                        <PreviewCanvas
                            baseImageUrl={baseImageUrl}
                            masksUrlPrefix={masksUrlPrefix}
                            selectedMaterials={version.snapshotStateJson as Record<DesignRegion, string>}
                            presetsMap={presetsMap}
                            selectedRegions={[]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
