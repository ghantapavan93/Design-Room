export const DESIGN_REGIONS = ["walls", "roof", "trim", "windows"] as const;

export type DesignRegion = typeof DESIGN_REGIONS[number];
