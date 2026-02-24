"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface StyleCard {
    label: string;
    description: string;
    palette: string[]; // hex swatches
    previewBg: string;
    tag: string;
}

const STYLE_CARDS: StyleCard[] = [
    {
        label: 'Contemporary',
        description: 'Bold dark exteriors with modern lines and warm wood accents.',
        palette: ['#1c1c1e', '#2c2c2e', '#4a3728', '#c9a96e'],
        previewBg: '#1c1c1e',
        tag: 'Most popular',
    },
    {
        label: 'Farmhouse',
        description: 'Crisp white with black trim and natural shiplap textures.',
        palette: ['#f5f5f0', '#1a1a1a', '#8b7d6b', '#d4c4a8'],
        previewBg: '#f5f5f0',
        tag: 'Classic',
    },
    {
        label: 'Japanese Modern',
        description: 'Warm tan with natural stone and minimalist detailing.',
        palette: ['#c4a882', '#8b7355', '#4a3f35', '#d4c4a8'],
        previewBg: '#c4a882',
        tag: 'Trending',
    },
    {
        label: 'Coastal',
        description: 'Soft sage greens and sea blues with white trim.',
        palette: ['#b2c9b0', '#5b7c6c', '#e8e4dc', '#f0ede5'],
        previewBg: '#b2c9b0',
        tag: '',
    },
    {
        label: 'Traditional',
        description: 'Warm greige with dark charcoal trim and classic moulding.',
        palette: ['#c8bcaa', '#3d3530', '#6b5b4e', '#ddd4c8'],
        previewBg: '#c8bcaa',
        tag: '',
    },
    {
        label: 'Monochrome',
        description: 'One tone, many textures. Elevated tonal sophistication.',
        palette: ['#d4c9b5', '#b8a898', '#9a8c7c', '#7c6e60'],
        previewBg: '#d4c9b5',
        tag: 'Editor\'s Pick',
    },
];

function IdeaCard({ card, onCustomize }: { card: StyleCard; onCustomize: () => void }) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <div
            className="idea-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Preview area */}
            <div
                className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden"
                style={{ background: card.previewBg }}
            >
                {/* Simulated house silhouette */}
                <svg viewBox="0 0 200 120" className="w-3/4 opacity-30" fill="white">
                    <polygon points="100,10 180,60 20,60" />
                    <rect x="40" y="60" width="120" height="60" />
                    <rect x="85" y="90" width="30" height="30" fill="rgba(0,0,0,0.2)" />
                    <rect x="50" y="70" width="25" height="25" fill="rgba(0,0,0,0.15)" />
                    <rect x="125" y="70" width="25" height="25" fill="rgba(0,0,0,0.15)" />
                </svg>

                {/* Tag */}
                {card.tag && (
                    <div
                        className="absolute top-3 left-3 pill text-xs"
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'white', backdropFilter: 'blur(8px)' }}
                    >
                        {card.tag}
                    </div>
                )}

                {/* Hover overlay */}
                <div
                    className="absolute inset-0 flex items-end p-3 gap-2 transition-opacity duration-200"
                    style={{ opacity: hovered ? 1 : 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
                >
                    <button
                        onClick={onCustomize}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                        style={{ background: 'white', color: '#0c0c0d' }}
                    >
                        Customize
                    </button>
                    <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                        title="Save"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Card footer */}
            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{card.label}</h3>
                    {/* Palette dots */}
                    <div className="flex -space-x-1">
                        {card.palette.map((hex, i) => (
                            <div
                                key={i}
                                className="w-4 h-4 rounded-full ring-1"
                                style={{ background: hex, boxShadow: '0 0 0 1.5px var(--bg-elevated)' }}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{card.description}</p>
                <button
                    className="w-full mt-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between px-3 transition-all"
                    style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onClick={onCustomize}
                >
                    Get the look
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
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

            {/* Filter row */}
            <div className="px-8 py-5 flex items-center gap-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {filters.map(f => (
                    <button
                        key={f}
                        className="category-btn flex-shrink-0"
                        style={activeFilter === f ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 600 } : {}}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="px-8 py-8 grid grid-cols-3 gap-5 max-w-7xl mx-auto">
                {filtered.map((card, i) => (
                    <div key={card.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <IdeaCard
                            card={card}
                            onCustomize={() => router.push('/design/1')}
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
