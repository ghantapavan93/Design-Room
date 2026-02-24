import * as React from 'react';
import { MaterialPreset } from '../../lib/types';

interface MaterialCardProps {
    preset: MaterialPreset;
    isSelected: boolean;
    onSelect: (preset: MaterialPreset) => void;
}

export function MaterialCard({ preset, isSelected, onSelect }: MaterialCardProps) {
    return (
        <div
            className="swatch-card"
            style={isSelected ? {
                borderColor: 'var(--text-primary)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.4)',
            } : {}}
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
            {/* Swatch block */}
            <div
                className="w-full aspect-square transition-all duration-200"
                style={{ backgroundColor: preset.swatchHex }}
            />
            {/* Info */}
            <div className="p-2.5 flex flex-col gap-0.5">
                <h4
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}
                    title={preset.name}
                >
                    {preset.name}
                </h4>
                <p
                    className="text-xs truncate"
                    style={{ color: 'var(--text-muted)' }}
                    title={preset.brand}
                >
                    {preset.brand}
                </p>
            </div>

            {/* Selected checkmark */}
            {isSelected && (
                <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#0c0c0d" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </div>
    );
}
