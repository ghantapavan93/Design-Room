'use client';

import Link from 'next/link';

// Interior room data using all the assets from folder 085052 and 085123
const INTERIOR_ROOMS = [
    {
        id: 'living',
        label: 'Living Room',
        desc: 'Curate your main living space with premium flooring, wall colours, and trim options.',
        thumb: '/assets/interior/interiors-1x1-01.png',
        wide: '/assets/interior/interiors-3x2-01.png',
        accent: '#c4855a',
        keyScreens: [
            '/assets/interior/interior-key-screens-9x16-01.png',
            '/assets/interior/interior-key-screens-9x16-02.png',
            '/assets/interior/interior-key-screens-9x16-03.png',
        ],
    },
    {
        id: 'kitchen',
        label: 'Kitchen',
        desc: 'Explore cabinet finishes, countertop materials, and backsplash combinations.',
        thumb: '/assets/interior/interiors-1x1-02.png',
        wide: '/assets/interior/interiors-3x2-02.png',
        accent: '#60a5fa',
        keyScreens: [
            '/assets/interior/interior-key-screens-9x16-04.png',
            '/assets/interior/interior-key-screens-9x16-05.png',
            '/assets/interior/interior-key-screens-9x16-06.png',
        ],
    },
    {
        id: 'bedroom',
        label: 'Bedroom',
        desc: 'Design a sanctuary with wall finishes, trim colours, and window styles.',
        thumb: '/assets/interior/interiors-1x1-03.png',
        wide: '/assets/interior/interiors-3x2-03.png',
        accent: '#a78bfa',
        keyScreens: [
            '/assets/interior/interior-key-screens-9x16-07.png',
            '/assets/interior/interior-key-screens-9x16-08.png',
            '/assets/interior/interior-key-screens-9x16-09.png',
        ],
    },
    {
        id: 'bathroom',
        label: 'Bathroom',
        desc: 'Choose tile patterns, fixture finishes, and accent walls for your bathroom.',
        thumb: '/assets/interior/interior-reference-measurement-9x16-01.png',
        wide: '/assets/interior/interior-reference-measurement-9x16-03.png',
        accent: '#34d399',
        keyScreens: [
            '/assets/interior/interior-reference-measurement-9x16-04.png',
            '/assets/interior/interior-reference-measurement-9x16-05.png',
            '/assets/interior/interior-reference-measurement-9x16-06.png',
        ],
    },
];

const DESIGN_STYLES = [
    {
        label: 'Contemporary',
        screens: [
            '/assets/interior/room-by-room-test-9x16-01.png',
            '/assets/interior/room-by-room-test-9x16-02.png',
            '/assets/interior/room-by-room-test-9x16-03.png',
        ],
        palette: ['#2a2e35', '#d4c4a0', '#4a7fa5'],
    },
    {
        label: 'Farmhouse',
        screens: [
            '/assets/interior/room-by-room-test-9x16-04.png',
            '/assets/interior/room-by-room-test-9x16-05.png',
            '/assets/interior/room-by-room-test-9x16-06.png',
        ],
        palette: ['#c4855a', '#d4c4a0', '#5a5f63'],
    },
    {
        label: 'Modern',
        screens: [
            '/assets/interior/room-by-room-test-9x16-07.png',
            '/assets/interior/room-by-room-test-9x16-08.png',
            '/assets/interior/room-by-room-test-9x16-09.png',
        ],
        palette: ['#0c0c0d', '#ffffff', '#60a5fa'],
    },
];

export default function InteriorsPage() {
    return (
        <div
            className="min-h-screen"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
        >
            {/* ── Top Nav ── */}
            <nav
                className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 h-16 backdrop-blur-md"
                style={{ background: 'rgba(12,12,13,0.85)', borderBottom: '1px solid var(--border-subtle)' }}
            >
                <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white' }}>D</span>
                    Design Room
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/ideas" className="hidden md:block text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>Ideas</Link>
                    <Link href="/interiors" className="text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--text-primary)', paddingBottom: '2px' }}>Interiors</Link>
                    <Link href="/design/1" className="px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-transform hover:-translate-y-0.5" style={{ background: '#2563eb', color: 'white' }}>
                        Open Editor
                    </Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <div className="px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
                        Interior Design Validation
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tighter max-w-4xl" style={{ color: 'var(--text-primary)' }}>
                    Design every room <br className="hidden md:block" />with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">absolute certainty.</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mb-16" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Explore materials, colours, and finishes for every room in your home — featuring interactive photorealistic renderings that sync in real time.
                </p>

                {/* 3-up interior preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 w-full">
                    {[
                        '/assets/interior/interiors-3x2-01.png',
                        '/assets/vw/vw-3x2-01.png',
                        '/assets/interior/interiors-3x2-03.png',
                    ].map((src, i) => (
                        <div
                            key={i}
                            className={`rounded-3xl overflow-hidden transform transition-transform duration-700 hover:scale-[1.03] ${i === 1 ? 'md:-translate-y-4' : ''}`}
                            style={{
                                aspectRatio: '3/2',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`Interior ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* ── Room Grid ── */}
                <div className="w-full text-left mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Browse by Room</h2>
                    <p className="text-base" style={{ color: 'var(--text-muted)' }}>Select a room to explore material options and design inspiration.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-24">
                    {INTERIOR_ROOMS.map(room => (
                        <div
                            key={room.id}
                            className="rounded-3xl flex flex-col md:flex-row overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-2xl"
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        >
                            {/* Room image */}
                            <div className="relative overflow-hidden w-full md:w-1/2 aspect-square md:aspect-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={room.thumb}
                                    alt={room.label}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* Overlay Mockups */}
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    {room.keyScreens.slice(0, 3).map((s, i) => (
                                        <div
                                            key={i}
                                            className="rounded flex-shrink-0 bg-black/20 overflow-hidden shadow-lg border border-white/20 transform hover:-translate-y-1 transition-transform"
                                            style={{ width: '48px', aspectRatio: '9/16' }}
                                        >
                                            <img src={s} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Room info */}
                            <div className="p-8 md:p-10 flex flex-col justify-center w-full md:w-1/2 text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-3 h-3 rounded-full" style={{ background: room.accent, boxShadow: `0 0 10px ${room.accent}` }} />
                                    <h3 className="text-2xl font-bold tracking-tight">{room.label}</h3>
                                </div>
                                <p className="text-base mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{room.desc}</p>
                                <div className="mt-auto">
                                    <Link
                                        href="/design/1"
                                        className="inline-flex flex-shrink-0 items-center justify-center gap-2 text-sm font-bold px-6 py-3 rounded-full transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                                        style={{ background: 'transparent', border: '1px solid var(--border-focus)', color: 'var(--text-primary)' }}
                                    >
                                        Configure Room
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Virtual Walkthrough section ── */}
                <div
                    className="rounded-[2.5rem] overflow-hidden w-full mb-24 relative"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)' }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-10 md:p-16 flex flex-col justify-center text-left">
                            <span className="text-xs font-bold uppercase tracking-widest mb-6 px-4 py-2 rounded-full w-fit shadow-sm" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                                Virtual Engine
                            </span>
                            <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                                Walk through every room in pure 3D.
                            </h2>
                            <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                We capture the full topological 3D model of your home space. Switch seamlessly between the architectural top-down dollhouse view and immersive room-by-room virtual walkthroughs.
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    href="/design/1"
                                    className="px-8 py-4 rounded-full text-sm font-bold shadow-md transition-transform hover:-translate-y-1"
                                    style={{ background: '#a78bfa', color: '#1a103c' }}
                                >
                                    Enter Virtual Mode →
                                </Link>
                            </div>
                        </div>
                        <div className="relative overflow-hidden min-h-[400px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/vw/vw-key-screens-08.png"
                                alt="3D dollhouse view"
                                className="w-full h-full object-cover object-left"
                            />
                            <div className="absolute top-6 left-6 backdrop-blur-md rounded-full px-4 py-2 border border-white/20" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse"></span>
                                    Interactive Dollhouse
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Design Styles ── */}
                <div className="w-full text-left mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Curated Design Styles</h2>
                    <p className="text-base" style={{ color: 'var(--text-muted)' }}>Explore professionally hand-picked palettes designed for interior spaces.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-24">
                    {DESIGN_STYLES.map(style => (
                        <div
                            key={style.label}
                            className="rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-500 hover:scale-[1.03]"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}
                        >
                            <div className="flex h-[180px]">
                                {style.screens.slice(0, 3).map((s, i) => (
                                    <div key={i} className="flex-1 overflow-hidden relative" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={s} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 md:p-8 flex items-center justify-between">
                                <h3 className="font-bold text-xl tracking-tight">{style.label}</h3>
                                <div className="flex gap-2">
                                    {style.palette.map(c => (
                                        <div key={c} className="w-6 h-6 rounded-full border border-white/10" style={{ background: c, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Room by Room CTA ── */}
                <div
                    className="w-full rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between text-left relative overflow-hidden group hover:scale-[1.01] transition-transform"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', border: '1px solid rgba(37,99,235,0.3)', boxShadow: '0 25px 50px -12px rgba(37,99,235,0.25)' }}
                >
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at right top, #3b82f6 0%, transparent 50%)' }}></div>
                    <div className="mb-8 md:mb-0 relative z-10 w-full md:w-2/3">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-[1.1] text-white">Start designing, room by room.</h2>
                        <p className="text-lg text-blue-200">Upload your home's photos and receive a meticulously crafted, interactive 3D model within hours.</p>
                    </div>
                    <Link
                        href="/design/1"
                        className="relative z-10 w-full md:w-auto text-center px-10 py-5 rounded-full text-base font-bold transition-all shadow-xl hover:-translate-y-1 hover:shadow-blue-500/30"
                        style={{ background: 'white', color: '#1e3a8a' }}
                    >
                        Enter Design Room →
                    </Link>
                </div>
            </div>
        </div>
    );
}
