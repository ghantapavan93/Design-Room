import { MaterialPreset } from './types';

export type EstimateLineItem = {
    region: string;
    qty: number;
    unit: string;
    baseRate: number;
    multiplier: number;
    cost: number;
    presetId: string;
};

export type EstimateMetadata = {
    measurementSource: 'demo_default' | 'uploaded' | 'lidar_scan' | 'manual';
    measurementConfidence: 'low' | 'medium' | 'high';
    assumptions: string[];
};

export const MOCK_MEASUREMENTS: Record<string, { value: number; unit: string; baseRate: number }> = {
    walls: { value: 2450, unit: 'sqft', baseRate: 4.5 },
    roof: { value: 1800, unit: 'sqft', baseRate: 3.8 },
    trim: { value: 450, unit: 'linear ft', baseRate: 2.5 },
    windows: { value: 12, unit: 'each', baseRate: 450 },
    door: { value: 1, unit: 'each', baseRate: 1200 },
    garage: { value: 1, unit: 'each', baseRate: 2500 },
    
    // Design 2 Elements
    wall_left_cedar: { value: 800, unit: 'sqft', baseRate: 6.5 },
    wall_center_white: { value: 1200, unit: 'sqft', baseRate: 4.5 },
    wall_right_upper_white: { value: 400, unit: 'sqft', baseRate: 4.5 },
    wall_right_dark_cladding: { value: 650, unit: 'sqft', baseRate: 5.5 },
    roof_center_connector: { value: 400, unit: 'sqft', baseRate: 3.8 },
    entry_canopy: { value: 120, unit: 'sqft', baseRate: 4.0 },
    window_left_tall: { value: 2, unit: 'each', baseRate: 650 },
    window_center_horizontal: { value: 1, unit: 'each', baseRate: 550 },
    window_right_upper: { value: 3, unit: 'each', baseRate: 400 },
    entry_glass: { value: 1, unit: 'each', baseRate: 850 },
    front_door: { value: 1, unit: 'each', baseRate: 1500 },
    garage_door: { value: 1, unit: 'each', baseRate: 2500 }
};

export const DEFAULT_METADATA: EstimateMetadata = {
    measurementSource: 'demo_default',
    measurementConfidence: 'low',
    assumptions: [
        'Quantities are based on demo defaults, not actual property measurements.',
        'Labor rates reflect regional averages and may vary by contractor.',
        'Material prices based on standard retail; bulk discounts not applied.',
        'Cost bands ($, $$, $$$) apply multipliers of 1.0x, 1.6x, and 2.4x respectively.',
    ]
};

export function computeEstimate(
    state: Record<string, string> | null | undefined,
    presetsMap: Record<string, MaterialPreset>,
    measurements: Record<string, { value: number; unit: string; baseRate: number }>,
    metadata: EstimateMetadata = DEFAULT_METADATA
) {
    const items: EstimateLineItem[] = [];
    if (!state) return { items, total: 0, metadata };

    for (const [region, presetId] of Object.entries(state)) {
        const preset = presetsMap[presetId];
        const m = measurements[region];
        if (!preset || !m) continue;

        const multiplier = preset.costBand === "$$$" ? 2.4 : preset.costBand === "$$" ? 1.6 : 1.0;
        const cost = m.value * m.baseRate * multiplier;

        items.push({
            region,
            qty: m.value,
            unit: m.unit,
            baseRate: m.baseRate,
            multiplier,
            cost,
            presetId,
        });
    }
    const total = items.reduce((a, i) => a + i.cost, 0);
    return { items, total, metadata };
}

