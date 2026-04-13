"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface StyleCard {
    label: string;
    description: string;
    palette: string[]; // hex swatches
    imageUrl: string;
    tag: string;
    elementCount?: number;
    designId?: number;
}

const STYLE_CARDS: StyleCard[] = [
    {
        label: 'Contemporary',
        description: 'Bold dark exteriors with modern lines and warm wood accents.',
        palette: ['#1c1c1e', '#2c2c2e', '#4a3728', '#c9a96e'],
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        tag: 'View Only',
        elementCount: 0,
    },
    {
        label: 'Farmhouse',
        description: 'Crisp white with black trim and natural shiplap textures.',
        palette: ['#f5f5f0', '#1a1a1a', '#8b7d6b', '#d4c4a8'],
        imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80',
        tag: 'Classic',
        elementCount: 4,
        designId: 2,
    },
    {
        label: 'Japanese Modern',
        description: 'Warm tan with natural stone and minimalist detailing.',
        palette: ['#c4a882', '#8b7355', '#4a3f35', '#d4c4a8'],
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        tag: 'View Only',
        elementCount: 0,
    },
    {
        label: 'Coastal',
        description: 'Soft sage greens and sea blues with white trim.',
        palette: ['#b2c9b0', '#5b7c6c', '#e8e4dc', '#f0ede5'],
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
        tag: 'Most Popular',
        elementCount: 4,
        designId: 1,
    },
    {
        label: 'Traditional',
        description: 'Warm greige with dark charcoal trim and classic moulding.',
        palette: ['#c8bcaa', '#3d3530', '#6b5b4e', '#ddd4c8'],
        imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
        tag: 'View Only',
        elementCount: 0,
    },
    {
        label: 'Monochrome',
        description: 'One tone, many textures. Elevated tonal sophistication.',
        palette: ['#d4c9b5', '#b8a898', '#9a8c7c', '#7c6e60'],
        imageUrl: 'https://images.unsplash.com/photo-1600607687644-aac4c15c827b?w=800&q=80',
        tag: 'View Only',
        elementCount: 0,
    },
];

function IdeaCard({ card, onCustomize }: { card: StyleCard; onCustomize: () => void }) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <div
            className="rounded-2xl overflow-hidden group shadow-sm transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 bg-white border border-neutral-200"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Preview area */}
            <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden bg-neutral-100">
                <img src={card.imageUrl} alt={card.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                {/* Tag */}
                {card.tag && (
                    <div
                        className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.9)', color: 'black', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                        {card.tag}
                    </div>
                )}
            </div>

            {/* Card footer */}
            <div className="p-5 flex flex-col h-[180px]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{card.label}</h3>
                    {/* Palette dots */}
                    <div className="flex -space-x-1">
                        {card.palette.map((hex, i) => (
                            <div
                                key={i}
                                className="w-4 h-4 rounded-full ring-2 ring-white"
                                style={{ background: hex, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-sm leading-relaxed mb-auto" style={{ color: 'var(--text-secondary)' }}>{card.description}</p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                    <button
                        onClick={() => {
                            if (card.elementCount && card.elementCount > 0) {
                                onCustomize();
                            } else {
                                alert("This design is currently 'View Only' as it has no editable masks available. Please choose a different design to edit.");
                            }
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${card.elementCount && card.elementCount > 0 ? '' : 'opacity-60 bg-neutral-100 text-neutral-600'}`}
                        style={card.elementCount && card.elementCount > 0 ? { background: 'var(--text-primary)', color: 'var(--bg-base)' } : {}}
                        onMouseOver={e => card.elementCount && card.elementCount > 0 && (e.currentTarget.style.opacity = '0.9')}
                        onMouseOut={e => card.elementCount && card.elementCount > 0 && (e.currentTarget.style.opacity = '1')}
                    >
                        {card.elementCount && card.elementCount > 0 ? 'Open in editor' : 'View Only (Missing Masks)'}
                        {card.elementCount && card.elementCount > 0 ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                        title="Save for later"
                    >
                        <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function IdeasPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = React.useState('All styles');
    const filters = ['All styles', 'Contemporary', 'Farmhouse', 'Coastal', 'Traditional', 'Trending'];

    const filtered = activeFilter === 'All styles'
        ? STYLE_CARDS
        : STYLE_CARDS.filter(c => c.label === activeFilter || c.tag === activeFilter);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
            {/* Nav */}
            <nav
                className="sticky top-0 z-50 px-8 py-4 flex items-center justify-between glass"
            >
                <div className="flex items-center gap-4">
                    <a href="/" className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </a>
                    <h1 className="font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Ideas for you <span style={{ color: 'var(--accent)' }}>✦</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="pill text-xs"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                    >
                        My photos
                    </button>
                    <button
                        className="pill text-xs"
                        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 600 }}
                        onClick={() => router.push('/design/1')}
                    >
                        Open editor →
                    </button>
                </div>
            </nav>

            {/* High-end Search + Filter row */}
            <div className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search inspiration..."
                        className="w-full pl-11 pr-4 py-3 rounded-full text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white border border-neutral-200"
                        style={{ color: 'var(--text-primary)' }}
                        onChange={(e) => setActiveFilter(e.target.value ? '' : 'All styles')}
                    />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                    {filters.map(f => (
                        <button
                            key={f}
                            className="px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex-shrink-0 transition-all border"
                            style={activeFilter === f
                                ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', borderColor: 'var(--text-primary)' }
                                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }
                            }
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="px-6 md:px-12 pt-10 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto min-h-[60vh]">
                {filtered.map((card, i) => (
                    <div key={card.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <IdeaCard
                            card={card}
                            onCustomize={() => {
                                if (card.designId) {
                                    router.push(`/design/${card.designId}`);
                                } else {
                                    router.push('/design/1'); // Fallback
                                }
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="text-center py-16 px-4">
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Have your own house photo? Start from scratch.
                </p>
                <button
                    className="px-8 py-3 rounded-full font-semibold text-sm transition-all"
                    style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                    onClick={() => router.push('/')}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                >
                    Upload a photo →
                </button>
            </div>
        </div>
    );
}
