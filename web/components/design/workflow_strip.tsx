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
        <div
            className="w-full shrink-0 flex items-center justify-center p-2 z-10"
            style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)' }}
        >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {WORKFLOW_STEPS.map((step, index) => {
                    const isDone = Boolean(progress.completed[index]);
                    const isActive = index === progress.activeIndex;
                    const isClickable = !!onStepClick;

                    return (
                        <React.Fragment key={step}>
                            <div
                                onClick={() => onStepClick && onStepClick(index)}
                                className={[
                                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors',
                                    isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                                    isDone ? 'bg-emerald-50 text-emerald-800' : isActive ? 'bg-neutral-900 text-white' : 'text-neutral-400',
                                    'border border-transparent'
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm',
                                        isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-400'
                                    ].join(' ')}
                                >
                                    {index + 1}
                                </span>
                                {step}
                            </div>

                            {index < WORKFLOW_STEPS.length - 1 && (
                                <svg className="w-3 h-3 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
