import * as React from 'react';

const WORKFLOW_STEPS = [
    'Select regions',
    'Apply materials',
    'Save option',
    'Compare',
    'Lock regions',
    'Takeoff',
    'Export',
];

type WorkflowProgress = {
    completed: boolean[];
    activeIndex: number;
};

export function WorkflowStrip({ progress, onStepClick }: { progress: WorkflowProgress, onStepClick?: (index: number) => void }) {
    return (
        <div className="w-full shrink-0 flex items-center justify-center p-2.5 z-10 bg-[#0f0f12] border-b border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full px-4">
                {WORKFLOW_STEPS.map((step, index) => {
                    const isDone = Boolean(progress.completed[index]);
                    const isActive = index === progress.activeIndex;
                    const isClickable = !!onStepClick;

                    return (
                        <React.Fragment key={step}>
                            <div
                                onClick={() => onStepClick && onStepClick(index)}
                                className={[
                                    'flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300 ease-out motion-reduce:transition-none',
                                    isClickable ? 'cursor-pointer hover:text-white' : 'cursor-default',
                                    isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-neutral-300'
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors duration-300',
                                        isDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                        isActive ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 
                                        'bg-white/5 text-neutral-300 border border-white/20'
                                    ].join(' ')}
                                >
                                    {isDone ? '✓' : index + 1}
                                </span>
                                {step}
                            </div>

                            {index < WORKFLOW_STEPS.length - 1 && (
                                <div className={`w-4 lg:w-6 h-px shrink-0 transition-colors duration-300 ${isDone ? 'bg-emerald-500/30' : 'bg-white/10'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
