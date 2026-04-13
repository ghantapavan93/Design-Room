import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { openProposalInNewTab } from './proposal_export';

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExport: (type: 'proposal' | 'summary') => void;
    designTitle: string;
    currentState: Record<string, string>;
    presetsMap: Record<string, any>;
    versions: any[];
    statusChip: string;
    lockedRegions?: string[];
    regionComments?: any[];
}

export function ExportDialog({
    open,
    onOpenChange,
    onExport,
    designTitle,
    currentState,
    presetsMap,
    versions,
    statusChip,
    lockedRegions = [],
    regionComments = []
}: ExportDialogProps) {
    const [exportType, setExportType] = React.useState<'proposal' | 'summary'>('proposal');

    const handleConfirm = () => {
        onExport(exportType);
        
        // For proposal we open the detailed PDF, for summary it's a lighter version.
        // For demo purposes both call the same export functionality.
        openProposalInNewTab({
            designTitle,
            currentState,
            presetsMap,
            versions,
            statusChip,
            lockedRegions,
            regionComments
        });
        
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="Export Options"
            description="Generate a PDF document of the current design."
        >
            <div className="mt-8 space-y-6">
                <div className="space-y-4">
                    <label
                        className="group border rounded-2xl p-4 cursor-pointer flex flex-col gap-2 transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden"
                        style={{
                            borderColor: exportType === 'proposal' ? 'rgba(59,130,246,0.5)' : 'var(--border-subtle)',
                            background: exportType === 'proposal' ? 'rgba(59,130,246,0.05)' : 'var(--bg-hover)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="exportType"
                                className="text-blue-500 bg-transparent"
                                style={{ borderColor: 'var(--border-default)' }}
                                checked={exportType === 'proposal'}
                                onChange={() => setExportType('proposal')}
                            />
                            <span className="font-black text-xs uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Full Proposal</span>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-widest pl-8">
                            Includes 3D snapshots, detailed material estimates, quantities, and terms.
                        </span>
                    </label>

                    <label
                        className="group border rounded-2xl p-4 cursor-pointer flex flex-col gap-2 transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden"
                        style={{
                            borderColor: exportType === 'summary' ? 'rgba(59,130,246,0.5)' : 'var(--border-subtle)',
                            background: exportType === 'summary' ? 'rgba(59,130,246,0.05)' : 'var(--bg-hover)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="exportType"
                                className="text-blue-500 bg-transparent"
                                style={{ borderColor: 'var(--border-default)' }}
                                checked={exportType === 'summary'}
                                onChange={() => setExportType('summary')}
                            />
                            <span className="font-black text-xs uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Executive Summary</span>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-widest pl-8">
                            Lightweight summary of selected materials without pricing details.
                        </span>
                    </label>
                </div>

                <div className="pt-6 mt-6 flex justify-end gap-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={{ color: 'var(--text-primary)', background: 'var(--bg-hover)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-sm"
                        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                    >
                        Generate PDF
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
