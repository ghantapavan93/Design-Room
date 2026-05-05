import * as React from 'react';
import { MaterialPreset } from '../../lib/types';

interface MaterialCardProps {
    preset: MaterialPreset;
    isSelected: boolean;
    onSelect: (preset: MaterialPreset) => void;
}

export function MaterialCard({ preset, isSelected, onSelect }: MaterialCardProps) {
    return (
        <button
            className={`group relative flex flex-col text-left w-full rounded-xl overflow-hidden shadow-sm transition-transform transition-shadow duration-300 ease-out motion-reduce:transition-none hover:scale-[1.02] border ${
                isSelected
                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'
            }`}
            onClick={() => {
                console.log('[DEBUG] MaterialCard onClick:', preset.id);
                onSelect(preset);
            }}
            role="button"
            aria-pressed={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(preset);
                }
            }}
        >
            {/* Swatch Image */}
            <div className="w-full aspect-square overflow-hidden bg-neutral-900 relative">
                <div
                    className="absolute inset-0 transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-105"
                    style={{
                        backgroundColor: preset.swatchHex,
                        backgroundImage: preset.thumbnailUrl ? `url(${preset.thumbnailUrl})` : 'none',
                        backgroundSize: 'cover'
                    }}
                />
                {/* Inner shadow ring for depth */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 z-10" />
            </div>

            {/* Quick Preview Hover Overlay */}
            <div className="absolute top-0 left-0 right-0 aspect-square bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none flex flex-col items-center justify-center p-2 z-20">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white drop-shadow-md">
                    {isSelected ? 'Applied' : 'Apply'}
                </span>
            </div>

            {/* Info Card portion */}
            <div className={`p-3 flex flex-col gap-1 w-full border-t z-10 transition-colors duration-300 motion-reduce:transition-none ${isSelected ? 'border-blue-100 bg-blue-50/30' : 'border-neutral-100 bg-white'}`}>
                <div className="flex flex-row justify-between items-start gap-1">
                    <h4
                        className={`text-[10px] font-black truncate leading-tight uppercase tracking-tight ${isSelected ? 'text-blue-900' : 'text-neutral-800'}`}
                        title={preset.name}
                    >
                        {preset.name}
                    </h4>
                    {preset.costBand && (
                        <span className="text-[9px] font-black tracking-widest shrink-0 px-1.5 py-0.5 rounded-md uppercase" style={{ background: 'rgba(52,211,153,0.15)', color: '#10b981', border: '1px solid rgba(52,211,153,0.1)' }}>
                            {preset.costBand}
                        </span>
                    )}
                </div>

                <div className="flex flex-row items-center justify-between">
                    <p
                        className="text-[9px] font-bold truncate uppercase tracking-widest text-neutral-500"
                        title={preset.brand}
                    >
                        {preset.brand}
                    </p>
                    {preset.sku && (
                        <p className="text-[8px] font-black tracking-[0.15em] text-neutral-600 uppercase">{preset.sku.split('-')[1] || preset.sku}</p>
                    )}
                </div>
            </div>

            {/* Selected checkmark */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-30 bg-blue-500 shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
}
