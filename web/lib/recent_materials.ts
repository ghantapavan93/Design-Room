import { MaterialPreset } from './types';

const STORAGE_KEY = 'design_room_recent_materials';
const MAX_RECENTS = 6;

export const getRecentMaterials = (): MaterialPreset[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as MaterialPreset[];
        }
    } catch {
        // fail silently
    }
    return [];
};

export const addRecentMaterial = (material: MaterialPreset) => {
    if (typeof window === 'undefined') return;
    try {
        const recents = getRecentMaterials();
        // Remove if it already exists to move it to the top
        const filtered = recents.filter(m => m.id !== material.id);
        const next = [material, ...filtered].slice(0, MAX_RECENTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // fail silently
    }
};
