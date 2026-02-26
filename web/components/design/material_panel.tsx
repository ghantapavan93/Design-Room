import * as React from 'react';
import { MaterialPreset } from '../../lib/types';
import { DesignRegion, DESIGN_REGIONS } from '../../lib/regions';
import { MaterialCard } from './material_card';
import { getRecentMaterials, addRecentMaterial } from '../../lib/recent_materials';

interface MaterialPanelProps {
    presets: MaterialPreset[];
    selectedRegions: DesignRegion[];
    onRegionChange: (regions: DesignRegion[]) => void;
    selectedMaterials: Record<DesignRegion, string>;
    onMaterialSelect: (regions: DesignRegion[], material: MaterialPreset) => void;
    pendingSuggestion?: { region: DesignRegion; preset: MaterialPreset; actorName: string };
    isSuggester?: boolean;
}

// Extended visual categories matching Hover's exact sidebar layout.
// Garage → maps to 'garage', Paint → 'walls', Door → 'door'
const VISUAL_CATEGORIES: { label: string; region: DesignRegion; icon: string }[] = [
    { label: 'Garage', region: 'garage', icon: '🚗' },
    { label: 'Paint', region: 'walls', icon: '🎨' },
    { label: 'Roof', region: 'roof', icon: '🔺' },
    { label: 'Windows', region: 'windows', icon: '🪟' },
    { label: 'Walls', region: 'walls', icon: '🏠' },
    { label: 'Door', region: 'door', icon: '🚪' },
];

// Brand grouping
const BRANDS = ['All brands', 'Sherwin-Williams', 'Benjamin Moore', 'Valspar', 'Dunn-Edwards', 'Behr', 'James Hardie', 'Owens Corning'];

// Color filter presets matching Hover's swatches
const COLOR_FILTERS = [
    { label: 'Dark Night', hex: '#2a2e35' },
    { label: 'Waller Green', hex: '#2e3b2f' },
    { label: 'Desert Sand', hex: '#d4c4a0' },
    { label: 'Carbon Dating', hex: '#5a5f63' },
    { label: 'Coastal Blue', hex: '#4a7fa5' },
    { label: 'Clay', hex: '#c4855a' },
];

export function MaterialPanel({
    presets,
    selectedRegions,
    onRegionChange,
    selectedMaterials,
    onMaterialSelect,
    pendingSuggestion,
    isSuggester
}: MaterialPanelProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedBrand, setSelectedBrand] = React.useState('All brands');
    const [brandMenuOpen, setBrandMenuOpen] = React.useState(false);
    const [colorFilter, setColorFilter] = React.useState<string | null>(null);
    const [recentMaterials, setRecentMaterials] = React.useState<MaterialPreset[]>([]);

    React.useEffect(() => {
        setRecentMaterials(getRecentMaterials());
    }, []);

    // active region determines which presets to show in the list
    const activeRegion = selectedRegions.length > 0 ? selectedRegions[selectedRegions.length - 1] : 'walls';

    const handleVisualCategory = (cat: typeof VISUAL_CATEGORIES[number]) => {
        onRegionChange([cat.region]);
    };

    const filteredPresets = React.useMemo(() => {
        return presets.filter(p =>
            // Depending on the dataset, if the preset's category doesn't strictly match the new DesignRegions
            // we will fallback to matching 'walls' with 'Paint'/'Walls' or 'trim' with 'Garage'/'Door'.
            // For now, assume exact match or default safe fallback.
            (p.category === activeRegion || (activeRegion === 'door' && p.category === 'trim') || (activeRegion === 'garage' && p.category === 'trim') || (activeRegion === 'walls' && p.category === 'walls')) &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (selectedBrand === 'All brands' || p.brand === selectedBrand) &&
            (!colorFilter || p.swatchHex === colorFilter)
        );
    }, [presets, activeRegion, searchQuery, selectedBrand, colorFilter]);

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
                        Customize
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
                            const isActive = activeRegion === cat.region;
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
                                            color: selectedBrand === brand ? 'var(--text-primary)' : 'var(--text-secondary)',
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
                            onClick={() => setColorFilter(colorFilter === cf.hex ? null : cf.hex)}
                            className="w-6 h-6 rounded-full transition-all"
                            style={{
                                background: cf.hex,
                                outline: colorFilter === cf.hex ? `2px solid var(--text-primary)` : '2px solid transparent',
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
                            className="w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                            onClick={() => {
                                // In a real app, this would trigger multiple apply_material events
                                // For the demo, we'll just toast or set a visual hint
                                setColorFilter(style.colors[0]);
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
            <div className="px-5 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{resultCount} results</span>
                {(searchQuery || selectedBrand !== 'All brands' || colorFilter) && (
                    <button
                        className="text-xs underline"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={() => { setSearchQuery(''); setSelectedBrand('All brands'); setColorFilter(null); }}
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
                {!searchQuery && selectedBrand === 'All brands' && !colorFilter && recentMaterials.filter(p => p.category === activeRegion || (activeRegion === 'door' && p.category === 'trim') || (activeRegion === 'garage' && p.category === 'trim')).length > 0 && (
                    <div>
                        <p className="text-xs mb-3 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recently Used</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            {recentMaterials
                                .filter(p => p.category === activeRegion || (activeRegion === 'door' && p.category === 'trim') || (activeRegion === 'garage' && p.category === 'trim'))
                                .map(preset => (
                                    <MaterialCard
                                        key={`recent-${preset.id}`}
                                        preset={preset}
                                        isSelected={selectedMaterials[activeRegion] === preset.id}
                                        onSelect={(p) => {
                                            addRecentMaterial(p);
                                            setRecentMaterials(getRecentMaterials());
                                            onMaterialSelect(selectedRegions.length > 0 ? selectedRegions : [activeRegion], p);
                                        }}
                                    />
                                ))}
                        </div>
                    </div>
                )}

                {/* ── Main Catalog ── */}
                <div>
                    {!searchQuery && selectedBrand === 'All brands' && !colorFilter && (
                        <p className="text-xs mb-3 font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>All Options</p>
                    )}
                    <div className="grid grid-cols-2 gap-2.5">
                        {filteredPresets.map(preset => (
                            <MaterialCard
                                key={preset.id}
                                preset={preset}
                                isSelected={selectedMaterials[activeRegion] === preset.id}
                                onSelect={(p) => {
                                    addRecentMaterial(p);
                                    setRecentMaterials(getRecentMaterials());
                                    onMaterialSelect(selectedRegions.length > 0 ? selectedRegions : [activeRegion], p);
                                }}
                            />
                        ))}
                        {filteredPresets.length === 0 && (
                            <div className="col-span-2 text-center py-10" style={{ color: 'var(--text-muted)' }}>
                                <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-sm">No results</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
