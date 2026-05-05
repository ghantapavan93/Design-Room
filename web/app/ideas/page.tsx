"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface StyleCard {
    label: string;
    description: string;
    palette: string[];
    imageUrl: string;
    tag: string;
    tagType?: 'popular' | 'trending' | 'new' | 'view-only';
    elementCount?: number;
    designId?: number;
    editorial?: 'trending' | 'contractor-favorite' | 'warm-modern';
}

const EDITORIAL_NOTES: Record<string, string> = {
    'trending':            '4 contractors chose this style this month',
    'contractor-favorite': 'Highest client satisfaction in regional surveys',
    'warm-modern':         'Pairs well with natural stone and wood accents',
};

const STYLE_CARDS: StyleCard[] = [
    {
        label: 'Contemporary',
        description: 'Bold dark exteriors with modern lines and warm wood accents.',
        palette: ['#1c1c1e', '#2c2c2e', '#4a3728', '#c9a96e'],
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        tag: 'View Only',
        tagType: 'view-only',
        elementCount: 0,
        editorial: 'trending',
    },
    {
        label: 'Farmhouse',
        description: 'Crisp white with black trim and natural shiplap textures.',
        palette: ['#f5f5f0', '#1a1a1a', '#8b7d6b', '#d4c4a8'],
        imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80',
        tag: 'Classic',
        tagType: 'popular',
        elementCount: 4,
        designId: 2,
        editorial: 'contractor-favorite',
    },
    {
        label: 'Japanese Modern',
        description: 'Warm tan with natural stone and minimalist detailing.',
        palette: ['#c4a882', '#8b7355', '#4a3f35', '#d4c4a8'],
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        tag: 'View Only',
        tagType: 'view-only',
        elementCount: 0,
        editorial: 'warm-modern',
    },
    {
        label: 'Coastal',
        description: 'Soft sage greens and sea blues with white trim.',
        palette: ['#b2c9b0', '#5b7c6c', '#e8e4dc', '#f0ede5'],
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
        tag: 'Most Popular',
        tagType: 'popular',
        elementCount: 4,
        designId: 1,
        editorial: 'trending',
    },
    {
        label: 'Traditional',
        description: 'Warm greige with dark charcoal trim and classic moulding.',
        palette: ['#c8bcaa', '#3d3530', '#6b5b4e', '#ddd4c8'],
        imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
        tag: 'View Only',
        tagType: 'view-only',
        elementCount: 0,
        editorial: 'contractor-favorite',
    },
    {
        label: 'Monochrome',
        description: 'One tone, many textures. Elevated tonal sophistication.',
        palette: ['#d4c9b5', '#b8a898', '#9a8c7c', '#7c6e60'],
        imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        tag: 'New',
        tagType: 'new',
        elementCount: 0,
        editorial: 'warm-modern',
    },
];

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
    popular:    { bg: 'rgba(59,130,246,0.12)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' },
    trending:   { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' },
    new:        { bg: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' },
    'view-only':{ bg: 'rgba(0,0,0,0.06)',      color: '#71717a', border: '1px solid rgba(0,0,0,0.12)' },
};

function IdeaCard({
    card,
    onCustomize,
    isSaved,
    onToggleSave,
}: {
    card: StyleCard;
    onCustomize: () => void;
    isSaved: boolean;
    onToggleSave: () => void;
}) {
    const isEditable = !!(card.elementCount && card.elementCount > 0);
    const tagStyle = TAG_STYLES[card.tagType || 'view-only'];
    const [showViewOnlyNote, setShowViewOnlyNote] = React.useState(false);
    const editorialNote = card.editorial ? EDITORIAL_NOTES[card.editorial] : undefined;

    return (
        <div className="card-surface flex flex-col group overflow-hidden" style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {/* Image */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img
                    src={card.imageUrl}
                    alt={card.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />

                {/* Tag chip */}
                {card.tag && (
                    <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full"
                        style={{ ...tagStyle, backdropFilter: 'blur(8px)' }}>
                        {card.tag}
                    </div>
                )}

                {/* View-only overlay state */}
                {!isEditable && (
                    <div className="absolute bottom-3 right-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>{card.label}</h3>
                    <div className="flex -space-x-1.5 shrink-0 mt-0.5">
                        {card.palette.map((hex, i) => (
                            <div key={i} className="w-4 h-4 rounded-full" style={{ background: hex, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                        ))}
                    </div>
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-2" style={{ color: 'var(--text-secondary)' }}>{card.description}</p>

                {/* Editorial micro-note */}
                {editorialNote && (
                    <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{editorialNote}</p>
                )}

                {/* View-only inline note */}
                {showViewOnlyNote && (
                    <p className="text-[11px] mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                        This style is view-only — masks aren't available yet.
                    </p>
                )}

                <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                        onClick={() => {
                            if (isEditable) {
                                setShowViewOnlyNote(false);
                                onCustomize();
                            } else {
                                setShowViewOnlyNote(v => !v);
                            }
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        style={isEditable
                            ? { background: 'var(--text-primary)', color: 'var(--text-inverse)' }
                            : { background: 'var(--bg-overlay)', color: 'var(--text-muted)', cursor: 'not-allowed' }
                        }>
                        {isEditable ? 'Open in editor' : 'View only'}
                        {isEditable && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>

                    {/* Save bookmark — subtle fill when saved */}
                    <button
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={{
                            border: '1px solid var(--border-default)',
                            background: isSaved ? 'rgba(59,130,246,0.08)' : 'var(--bg-elevated)',
                            color: isSaved ? '#3b82f6' : 'var(--text-muted)',
                        }}
                        title={isSaved ? 'Remove from saved' : 'Save style'}
                        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                        onMouseOver={e => { if (!isSaved) { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                        onMouseOut={e => { if (!isSaved) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                    >
                        <svg className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

const FILTERS = [
    { label: 'All styles', value: 'all' },
    { label: 'Contemporary', value: 'Contemporary' },
    { label: 'Farmhouse', value: 'Farmhouse' },
    { label: 'Coastal', value: 'Coastal' },
    { label: 'Traditional', value: 'Traditional' },
    { label: 'Trending', value: 'trending' },
];

const EDITORIAL_ROWS: { key: StyleCard['editorial']; label: string; badge: string }[] = [
    { key: 'trending',            label: 'Trending Now',           badge: '🔥 Hot' },
    { key: 'contractor-favorite', label: 'Contractor Favourites',  badge: '⭐ Top Rated' },
    { key: 'warm-modern',         label: 'Warm Modern',            badge: '✦ Curated' },
];

export default function IdeasPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Persistent saved styles — localStorage-backed Set
    const [savedStyles, setSavedStyles] = React.useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        try { return new Set(JSON.parse(localStorage.getItem('dr_savedStyles') || '[]')); } catch { return new Set(); }
    });
    const toggleSave = React.useCallback((label: string) => {
        setSavedStyles(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label); else next.add(label);
            try { localStorage.setItem('dr_savedStyles', JSON.stringify([...next])); } catch { }
            return next;
        });
    }, []);

    const filtered = STYLE_CARDS.filter(c => {
        const matchFilter = activeFilter === 'all' || c.label === activeFilter || c.editorial === activeFilter;
        const matchSearch = !searchQuery || c.label.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchFilter && matchSearch;
    });

    const showEditorial = activeFilter === 'all' && !searchQuery;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

            {/* ── Nav ── */}
            <nav className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="shell flex items-center justify-between h-[60px]">
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Home
                        </a>
                        <span style={{ color: 'var(--border-default)' }}>|</span>
                        <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            Ideas
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                            style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                            My saved styles
                            {savedStyles.size > 0 && (
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}>
                                    {savedStyles.size}
                                </span>
                            )}
                        </button>
                        <button
                            className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:-translate-y-0.5"
                            style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                            onClick={() => router.push('/design/1')}>
                            Open editor →
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Page Intro ── */}
            <div className="shell section-sm" style={{ paddingTop: '48px', paddingBottom: '0' }}>
                <div className="section-intro left" style={{ marginBottom: '32px' }}>
                    <span className="eyebrow">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
                        Inspiration gallery
                    </span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        Find your style
                    </h1>
                    <p className="text-base max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Browse curated exterior design styles. Open any style in the editor to apply materials to your own home photo.
                    </p>
                </div>
            </div>

            {/* ── Sticky Search + Filter Rail ── */}
            <div className="sticky z-30" style={{ top: '60px', background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="shell py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-shrink-0" style={{ width: '220px' }}>
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search styles..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-full focus:outline-none transition-all"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                        />
                    </div>

                    {/* Filter chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                        {FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setActiveFilter(f.value)}
                                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                                style={activeFilter === f.value
                                    ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', border: '1px solid transparent' }
                                    : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {filtered.length} styles
                    </div>
                </div>
            </div>

            {/* ── Gallery ── */}
            <div className="shell" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
                {showEditorial ? (
                    // Editorial rows layout
                    <div className="flex flex-col gap-12">
                        {EDITORIAL_ROWS.map(row => {
                            const rowCards = STYLE_CARDS.filter(c => c.editorial === row.key);
                            // Only render editorial row if we have 2+ cards — avoids orphan half-rows
                            if (rowCards.length < 2) return null;
                            // Use 2-col for exactly 2 cards to avoid orphan empty cell
                            const colClass = rowCards.length === 2
                                ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
                                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
                            return (
                                <div key={row.key}>
                                    <div className="editorial-label">
                                        <h2>{row.label}</h2>
                                        <span className="badge">{row.badge}</span>
                                    </div>
                                    <div className={colClass}>
                                        {rowCards.map((card, i) => (
                                            <div key={card.label} className={`reveal reveal-d${i + 1}`}>
                                                <IdeaCard
                                                    card={card}
                                                    isSaved={savedStyles.has(card.label)}
                                                    onToggleSave={() => toggleSave(card.label)}
                                                    onCustomize={() => {
                                                        if (card.designId) router.push(`/design/${card.designId}`);
                                                        else router.push('/design/1');
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* All styles separator */}
                        <div>
                            <div className="editorial-label">
                                <h2>All Styles</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {STYLE_CARDS.map((card, i) => (
                                    <div key={card.label} className={`reveal reveal-d${(i % 6) + 1}`}>
                                        <IdeaCard
                                            card={card}
                                            isSaved={savedStyles.has(card.label)}
                                            onToggleSave={() => toggleSave(card.label)}
                                            onCustomize={() => {
                                                if (card.designId) router.push(`/design/${card.designId}`);
                                                else router.push('/design/1');
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Filtered flat grid
                    filtered.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((card, i) => (
                                <div key={card.label} className={`reveal reveal-d${(i % 6) + 1}`}>
                                    <IdeaCard
                                        card={card}
                                        isSaved={savedStyles.has(card.label)}
                                        onToggleSave={() => toggleSave(card.label)}
                                        onCustomize={() => {
                                            if (card.designId) router.push(`/design/${card.designId}`);
                                            else router.push('/design/1');
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <svg className="w-10 h-10 mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No styles match</p>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filter.</p>
                            <button className="text-sm font-bold px-5 py-2 rounded-full transition-all"
                                style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}>
                                Clear filters
                            </button>
                        </div>
                    )
                )}

                {/* Upload CTA */}
                <div className="mt-16 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
                    style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Your home</p>
                        <h3 className="text-xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                            Have your own house photo?
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upload it and our AI will segment it in under 2 minutes.</p>
                    </div>
                    <button
                        className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg"
                        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: '0 8px 20px -4px rgba(0,0,0,0.25)' }}
                        onClick={() => router.push('/')}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload a photo →
                    </button>
                </div>
            </div>
        </div>
    );
}
