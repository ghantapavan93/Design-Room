export const DESIGN_REGIONS = ["walls", "roof", "windows", "door", "garage"] as const;

export type DesignRegion = typeof DESIGN_REGIONS[number];

export const DESIGN_ELEMENTS = [
    "entry_canopy",
    "roof_center_connector",
    "wall_left_cedar",
    "wall_center_white",
    "wall_right_upper_white",
    "wall_right_dark_cladding",
    "window_left_tall",
    "window_center_horizontal",
    "window_right_upper",
    "entry_glass",
    "front_door",
    "garage_door"
] as const;

export type DesignElementId = typeof DESIGN_ELEMENTS[number];
