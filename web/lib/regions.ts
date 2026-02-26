export const DESIGN_REGIONS = ["walls", "roof", "trim", "windows", "door", "garage"] as const;

export type DesignRegion = typeof DESIGN_REGIONS[number];
