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
            className="group relative flex flex-col text-left transition-all duration-200 overflow-hidden w-full rounded-xl"
            style={isSelected ? {
                background: 'var(--bg-active)',
                borderColor: 'var(--text-primary)',
                boxShadow: '0 0 0 1.5px var(--text-primary), 0 4px 12px rgba(0,0,0,0.5)',
            } : {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
            }}
            onClick={() => onSelect(preset)}
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
            <div
                className="w-full aspect-square transition-transform duration-300 group-hover:scale-105"
                style={{
                    backgroundColor: preset.swatchHex,
                    backgroundImage: preset.thumbnailUrl ? `url(${preset.thumbnailUrl})` : 'none',
                    backgroundSize: 'cover'
                }}
            />

            {/* Quick Preview Hover Overlay */}
            <div className="absolute top-0 left-0 right-0 aspect-square bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-2">
                <span className="text-xs font-bold text-white tracking-widest uppercase drop-shadow-md">
                    {isSelected ? 'Applied' : 'Apply'}
                </span>
            </div>

            {/* Info Card portion */}
            <div className="p-3 flex flex-col gap-1 w-full bg-zinc-900 border-t border-white/10 z-10">
                <div className="flex flex-row justify-between items-start gap-1">
                    <h4
                        className="text-xs font-semibold truncate leading-tight"
                        style={{ color: 'var(--text-primary)' }}
                        title={preset.name}
                    >
                        {preset.name}
                    </h4>
                    {preset.cost_band && (
                        <span className="text-[10px] font-mono tracking-tighter shrink-0 px-1 py-0.5 rounded-sm" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                            {preset.cost_band}
                        </span>
                    )}
                </div>

                <div className="flex flex-row items-center justify-between">
                    <p
                        className="text-[11px] truncate"
                        style={{ color: 'var(--text-muted)' }}
                        title={preset.brand}
                    >
                        {preset.brand}
                    </p>
                    {preset.sku && (
                        <p className="text-[9px] font-mono tracking-wider opacity-50 uppercase">{preset.sku.split('-')[1] || preset.sku}</p>
                    )}
                </div>
            </div>

            {/* Selected checkmark */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-20" style={{ background: 'var(--text-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--bg-base)" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
}
