import * as React from 'react';
import { MaterialPreset, DesignElement } from '../../lib/types';
import { DesignRegion, DESIGN_REGIONS } from '../../lib/regions';
import { MaterialCard } from './material_card';
import { getRecentMaterials, addRecentMaterial } from '../../lib/recent_materials';

interface MaterialPanelProps {
    presets: MaterialPreset[];
    selectedRegions: string[];
    onRegionChange: (regions: string[]) => void;
    selectedMaterials: Record<string, string>;
    onMaterialSelect: (regions: string[], material: MaterialPreset) => void;
    pendingSuggestion?: { region: string; preset: MaterialPreset; actorName: string };
    isSuggester?: boolean;
    activeElementName?: string;
    elements?: DesignElement[];
}

// Extended visual categories matching Hover's exact sidebar layout.
// Garage → maps to 'garage', Paint → 'walls', Door → 'door'
const VISUAL_CATEGORIES: { label: string; region: string; icon: string }[] = [
    { label: 'Garage', region: 'garage', icon: '🚗' },
    { label: 'Paint', region: 'walls', icon: '🎨' },
    { label: 'Roof', region: 'roof', icon: '🔺' },
    { label: 'Windows', region: 'windows', icon: '🪟' },
    { label: 'Walls', region: 'walls', icon: '🏠' },
    { label: 'Door', region: 'door', icon: '🚪' },
];

// Brand grouping
const BRANDS = ['All brands', 'Sherwin-Williams', 'Benjamin Moore', 'Valspar', 'Dunn-Edwards', 'Behr', 'James Hardie', 'Owens Corning'];

// Color filter presets matching visual swatches but mapping to Color Families
const COLOR_FILTERS = [
    { label: 'Black / Dark', hex: '#212121', family: 'Black' },
    { label: 'Gray / Slate', hex: '#5c5e60', family: 'Gray' },
    { label: 'White / Cream', hex: '#f5f5f5', family: 'White' },
    { label: 'Beige / Tan', hex: '#d6cba8', family: 'Beige' },
    { label: 'Blue / Coastal', hex: '#4a7fa5', family: 'Blue' },
    { label: 'Red / Brick', hex: '#a4463b', family: 'Red' },
    { label: 'Brown / Earth', hex: '#6b635c', family: 'Brown' },
    { label: 'Green / Sage', hex: '#8d9c82', family: 'Green' },
];

export function MaterialPanel({
    presets,
    selectedRegions,
    onRegionChange,
    selectedMaterials,
    onMaterialSelect,
    pendingSuggestion,
    isSuggester,
    activeElementName,
    elements = [],
}: MaterialPanelProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedBrand, setSelectedBrand] = React.useState('All brands');
    const [brandMenuOpen, setBrandMenuOpen] = React.useState(false);
    const [colorFamilyFilter, setColorFamilyFilter] = React.useState<string | null>(null);
    const [styleFilter, setStyleFilter] = React.useState<string | null>(null);
    const [recentMaterials, setRecentMaterials] = React.useState<MaterialPreset[]>([]);

    React.useEffect(() => {
        setRecentMaterials(getRecentMaterials());
    }, []);

    // Correctly map the active selection to a material category
    const activeCategory = React.useMemo(() => {
        if (selectedRegions.length === 0) return 'walls';
        const lastId = selectedRegions[selectedRegions.length - 1];
        const element = elements.find(e => e.id === lastId);
        if (element) return element.groupKey;
        return lastId; // fallback to 'walls', 'roof', etc.
    }, [selectedRegions, elements]);

    // Automatically clear specific filters when changing categories to ensure "Automatic Show All"
    React.useEffect(() => {
        setSearchQuery('');
        setColorFamilyFilter(null);
        setStyleFilter(null);
    }, [activeCategory]);

    const handleVisualCategory = (cat: { label: string; region: string; icon: string }) => {
        onRegionChange([cat.region]);
        setSearchQuery('');
        setColorFamilyFilter(null);
        setStyleFilter(null);
    };

    const filteredPresets = React.useMemo(() => {
        return presets.filter(p => {
            // Match the material category to our active selection category
            const categoryMatch = p.category === activeCategory ||
                (activeCategory === 'walls' && p.category === 'walls') ||
                (activeCategory === 'trim' && (p.category === 'trim' || p.category === 'walls')) ||
                ((activeCategory === 'door' || activeCategory === 'garage') && (p.category === activeCategory || p.category === 'trim'));

            if (!categoryMatch) return false;

            const searchMatch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase());

            if (!searchMatch) return false;

            const brandMatch = selectedBrand === 'All brands' || p.brand === selectedBrand;
            if (!brandMatch) return false;

            const colorMatch = !colorFamilyFilter || p.colorFamily === colorFamilyFilter;
            if (!colorMatch) return false;

            const styleMatch = !styleFilter || (
                styleFilter === 'Modern Charcoal' ? ['black', 'gray', 'charcoal', 'iron', 'modern'].some(k => p.name.toLowerCase().includes(k)) :
                    styleFilter === 'Pacific Coast' ? ['blue', 'white', 'mist', 'coastal', 'navy', 'pacific'].some(k => p.name.toLowerCase().includes(k)) :
                        styleFilter === 'Desert Oasis' ? ['beige', 'sand', 'tan', 'terra', 'brown', 'walnut', 'oasis'].some(k => p.name.toLowerCase().includes(k)) : true
            );

            return styleMatch;
        });
    }, [presets, activeCategory, searchQuery, selectedBrand, colorFamilyFilter, styleFilter]);

    const resultCount = filteredPresets.length;

    return (
        <div
            className="w-80 h-full flex flex-col z-10 overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-subtle)' }}
        >
            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                        Customize {activeElementName && <span style={{ color: 'var(--text-primary)' }}>• {activeElementName}</span>}
                    </span>
                    {isSuggester && (
                        <span className="pill text-xs" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                            Suggest mode
                        </span>
                    )}
                </div>

                {/* Category row — Hover's exact layout: Garage  Paint  Roof / Windows  Walls  Door */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                        {VISUAL_CATEGORIES.map(cat => {
                            const hasSuggestion = pendingSuggestion?.region === cat.region;
                            const isActive = activeCategory === cat.region;
                            return (
                                <button
                                    key={cat.label}
                                    onClick={() => handleVisualCategory(cat)}
                                    className="category-btn"
                                    style={isActive ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 600 } : {}}
                                >
                                    {cat.label}
                                    {hasSuggestion && (
                                        <span className="inline-block w-1.5 h-1.5 rounded-full ml-1" style={{ background: '#60a5fa' }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter row: Color search + Brands dropdown */}
                <div className="flex gap-2">
                    {/* Search */}
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-muted)' }}>
                            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Color..."
                            style={{
                                width: '100%',
                                paddingLeft: '2rem',
                                paddingRight: '0.75rem',
                                paddingTop: '7px',
                                paddingBottom: '7px',
                                fontSize: '13px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border-default)',
                                background: 'var(--bg-overlay)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                        />
                    </div>

                    {/* Brand dropdown */}
                    <div className="relative">
                        <button
                            className="filter-btn"
                            onClick={() => setBrandMenuOpen(v => !v)}
                        >
                            <span>{selectedBrand === 'All brands' ? 'Brands' : selectedBrand.split(' ')[0]}</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {brandMenuOpen && (
                            <div
                                className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50"
                                style={{
                                    minWidth: '190px',
                                    background: 'var(--bg-overlay)',
                                    border: '1px solid var(--border-default)',
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                {BRANDS.map(brand => (
                                    <button
                                        key={brand}
                                        className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                        style={{
                                            color: 'var(--text-primary)',
                                            background: selectedBrand === brand ? 'var(--bg-active)' : 'transparent',
                                        }}
                                        onClick={() => { setSelectedBrand(brand); setBrandMenuOpen(false); }}
                                        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                        onMouseOut={e => (e.currentTarget.style.background = selectedBrand === brand ? 'var(--bg-active)' : 'transparent')}
                                    >
                                        {selectedBrand === brand && (
                                            <span className="mr-1.5" style={{ color: 'var(--accent)' }}>✓ </span>
                                        )}
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick colour swatches (Hover reference design) ── */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Quick Select</p>
                <div className="flex flex-wrap gap-1.5">
                    {COLOR_FILTERS.map(cf => (
                        <button
                            key={cf.label}
                            title={cf.label}
                            onClick={() => setColorFamilyFilter(colorFamilyFilter === cf.family ? null : cf.family)}
                            className="w-6 h-6 rounded-full transition-all"
                            style={{
                                background: cf.hex,
                                outline: colorFamilyFilter === cf.family ? `2px solid var(--text-primary)` : '2px solid transparent',
                                outlineOffset: '2px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Design Styles (Premium recommendations) ── */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-xs mb-3 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pro Styles</p>
                <div className="space-y-2">
                    {[
                        { name: 'Modern Charcoal', desc: 'Sleek & bold', colors: ['#2a2e35', '#2e3b2f', '#5a5f63'] },
                        { name: 'Pacific Coast', desc: 'Calm & airy', colors: ['#4a7fa5', '#ffffff', '#d4c4a0'] },
                        { name: 'Desert Oasis', desc: 'Warm & earthy', colors: ['#c4855a', '#d4c4a0', '#2a2e35'] },
                    ].map(style => (
                        <button
                            key={style.name}
                            className="w-full flex items-center gap-3 p-2 rounded-xl transition-all border"
                            style={{
                                background: styleFilter === style.name ? 'var(--bg-active)' : 'transparent',
                                borderColor: styleFilter === style.name ? 'var(--accent)' : 'transparent'
                            }}
                            onClick={() => {
                                setStyleFilter(styleFilter === style.name ? null : style.name);
                                setColorFamilyFilter(null);
                            }}
                        >
                            <div className="flex -space-x-1.5">
                                {style.colors.map(c => (
                                    <div key={c} className="w-5 h-5 rounded-full border border-bg-base" style={{ background: c }} />
                                ))}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{style.name}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{style.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Result count ── */}
            <div className="px-5 py-3 flex items-center justify-between mt-auto bg-white/5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{resultCount} results</span>
                {(searchQuery || selectedBrand !== 'All brands' || colorFamilyFilter || styleFilter) && (
                    <button
                        className="text-xs underline"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={() => { setSearchQuery(''); setSelectedBrand('All brands'); setColorFamilyFilter(null); setStyleFilter(null); }}
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* ── Suggester hint ── */}
            {isSuggester && (
                <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl text-xs flex items-start gap-2" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd' }}>
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Suggest mode — your selections are proposals, not changes.</p>
                </div>
            )}

            {/* ── Swatch grid ── */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

                {/* ── Recently Used (Empty Search Context) ── */}
                {!searchQuery && selectedBrand === 'All brands' && !colorFamilyFilter && !styleFilter && recentMaterials.filter(p => p.category === activeCategory || (activeCategory === 'door' && p.category === 'trim') || (activeCategory === 'garage' && p.category === 'trim')).length > 0 && (
                    <div>
                        <p className="text-xs mb-3 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recently Used</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {recentMaterials
                                .filter(p => p.category === activeCategory || (activeCategory === 'door' && p.category === 'trim') || (activeCategory === 'garage' && p.category === 'trim'))
                                .map(preset => {
                                    const isSelected = selectedRegions.length > 0
                                        ? selectedRegions.every(r => selectedMaterials[r] === preset.id)
                                        : selectedMaterials[activeCategory] === preset.id;

                                    return (
                                        <MaterialCard
                                            key={`recent-${preset.id}`}
                                            preset={preset}
                                            isSelected={isSelected}
                                            onSelect={(p) => {
                                                addRecentMaterial(p);
                                                setRecentMaterials(getRecentMaterials());
                                                onMaterialSelect(selectedRegions.length > 0 ? selectedRegions : [activeCategory], p);
                                            }}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* ── Main Catalog ── */}
                <div>
                    {!searchQuery && selectedBrand === 'All brands' && !colorFamilyFilter && !styleFilter && (
                        <p className="text-xs mb-3 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>All Options</p>
                    )}
                    <div className="grid grid-cols-2 gap-2.5">
                        {filteredPresets.map(preset => {
                            const isSelected = selectedRegions.length > 0
                                ? selectedRegions.every(r => selectedMaterials[r] === preset.id)
                                : selectedMaterials[activeCategory] === preset.id;

                            return (
                                <MaterialCard
                                    key={preset.id}
                                    preset={preset}
                                    isSelected={isSelected}
                                    onSelect={(p) => {
                                        addRecentMaterial(p);
                                        setRecentMaterials(getRecentMaterials());
                                        onMaterialSelect(selectedRegions.length > 0 ? selectedRegions : [activeCategory], p);
                                    }}
                                />
                            );
                        })}
                        {filteredPresets.length === 0 && (
                            <div className="col-span-2 text-center py-8">
                                <svg className="w-8 h-8 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No materials found</p>
                                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria.</p>
                                <button
                                    className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                                    onClick={() => { setSearchQuery(''); setSelectedBrand('All brands'); setColorFamilyFilter(null); setStyleFilter(null); }}
                                    style={{ background: 'var(--bg-active)', color: 'var(--text-primary)' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'var(--bg-active)'}
                                >
                                    Reset filters
                                </button>

                                <div className="mt-8 text-left">
                                    <p className="text-xs mb-3 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recommended</p>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {presets.filter(p => p.category === activeCategory || (activeCategory === 'door' && p.category === 'trim') || (activeCategory === 'garage' && p.category === 'trim') || (activeCategory === 'walls' && p.category === 'walls')).slice(0, 2).map((preset) => (
                                            <MaterialCard
                                                key={`fallback-${preset.id}`}
                                                preset={preset}
                                                isSelected={selectedMaterials[activeCategory] === preset.id}
                                                onSelect={(p) => {
                                                    addRecentMaterial(p);
                                                    setRecentMaterials(getRecentMaterials());
                                                    onMaterialSelect(selectedRegions.length > 0 ? selectedRegions : [activeCategory], p);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
