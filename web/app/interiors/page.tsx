'use client';

import Link from 'next/link';

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
        desc: 'Crisp contrasts, clean geometry, premium dark surfaces.',
        screens: [
            '/assets/interior/room-by-room-test-9x16-01.png',
            '/assets/interior/room-by-room-test-9x16-02.png',
            '/assets/interior/room-by-room-test-9x16-03.png',
        ],
        palette: ['#2a2e35', '#d4c4a0', '#4a7fa5'],
    },
    {
        label: 'Farmhouse',
        desc: 'Warm wood, exposed texture, and earthy tones.',
        screens: [
            '/assets/interior/room-by-room-test-9x16-04.png',
            '/assets/interior/room-by-room-test-9x16-05.png',
            '/assets/interior/room-by-room-test-9x16-06.png',
        ],
        palette: ['#c4855a', '#d4c4a0', '#5a5f63'],
    },
    {
        label: 'Modern',
        desc: 'Monochrome precision — black, white, and architectural light.',
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
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

            {/* ── Nav ── */}
            <nav className="sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="shell flex items-center justify-between h-[60px]">
                    <Link href="/" className="flex items-center gap-2.5 no-underline">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white' }}>D</span>
                        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Design Room</span>
                    </Link>
                    <div className="flex items-center gap-5">
                        <Link href="/ideas" className="hidden md:block text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>Ideas</Link>
                        <Link href="/interiors" className="text-sm font-semibold" style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--text-primary)', paddingBottom: '2px' }}>Interiors</Link>
                        <Link href="/design/1" className="text-sm font-bold px-4 py-2 rounded-full transition-all hover:-translate-y-0.5"
                            style={{ background: '#2563eb', color: 'white' }}>
                            Open Editor
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="section" style={{ paddingTop: '72px', paddingBottom: '80px' }}>
                <div className="shell">
                    <div className="section-intro reveal">
                        <span className="eyebrow">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#60a5fa' }} />
                            Interior design validation
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tighter max-w-3xl"
                            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            Design every room with{' '}
                            <span className="bg-clip-text text-transparent"
                                style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)' }}>
                                absolute certainty.
                            </span>
                        </h1>
                        <p className="text-base md:text-lg max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                            Explore materials, colours, and finishes for every room — interactive photorealistic renderings that sync in real time with your contractor.
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <Link href="/design/1"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg"
                                style={{ background: '#2563eb', color: 'white', boxShadow: '0 8px 24px -4px rgba(37,99,235,0.4)' }}>
                                Start designing →
                            </Link>
                            <Link href="#rooms"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                                Browse rooms ↓
                            </Link>
                        </div>
                    </div>

                    {/* 3-up preview — framed stage */}
                    <div className="grid grid-cols-3 gap-4 reveal reveal-d2" style={{ marginTop: '8px' }}>
                        {[
                            '/assets/interior/interiors-3x2-01.png',
                            '/assets/vw/vw-3x2-01.png',
                            '/assets/interior/interiors-3x2-03.png',
                        ].map((src, i) => (
                            <div key={i} className="stage-frame overflow-hidden"
                                style={{ aspectRatio: '3/2' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Interior ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Browse by Room ── */}
            <section id="rooms" className="section" style={{ background: 'var(--bg-overlay)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="shell">
                    <div className="section-intro left" style={{ marginBottom: '40px' }}>
                        <span className="eyebrow">Step 1</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter" style={{ letterSpacing: '-0.025em' }}>Browse by room</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a room to explore material options and design inspiration.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {INTERIOR_ROOMS.map((room, i) => (
                            <div key={room.id} className={`card-surface flex flex-col md:flex-row overflow-hidden group cursor-pointer reveal reveal-d${i + 1}`}>
                                {/* Room image */}
                                <div className="relative overflow-hidden w-full md:w-[220px] shrink-0" style={{ aspectRatio: '4/3' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={room.thumb} alt={room.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />

                                    {/* Screen mockups */}
                                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                                        {room.keyScreens.slice(0, 3).map((s, j) => (
                                            <div key={j} className="rounded overflow-hidden shadow-lg border border-white/20 shrink-0"
                                                style={{ width: '36px', aspectRatio: '9/16', background: 'rgba(0,0,0,0.3)' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={s} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Room info */}
                                <div className="p-6 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <span className="w-2 h-2 rounded-full" style={{ background: room.accent }} />
                                            <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{room.label}</h3>
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{room.desc}</p>
                                    </div>
                                    <Link
                                        href="/design/1"
                                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                                        style={{ color: room.accent }}>
                                        Configure Room
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Dollhouse / Virtual Walkthrough Stage ── */}
            <section className="section">
                <div className="shell">
                    <div className="section-intro left" style={{ marginBottom: '40px' }}>
                        <span className="eyebrow">Step 2</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter" style={{ letterSpacing: '-0.025em' }}>Measure & validate in 3D</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Switch between the architectural dollhouse view and immersive room-by-room walkthroughs.</p>
                    </div>

                    <div className="stage-frame overflow-hidden reveal">
                        <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '400px' }}>
                            {/* Copy */}
                            <div className="p-8 md:p-12 flex flex-col justify-center" style={{ background: 'var(--bg-overlay)' }}>
                                <span className="eyebrow mb-5" style={{ width: 'fit-content' }}>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a78bfa' }} />
                                    Virtual Engine
                                </span>
                                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tighter mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                                    Walk through every room in pure 3D.
                                </h3>
                                <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                    We capture the full topological 3D model of your home. Switch seamlessly between the architectural top-down dollhouse view and immersive virtual walkthroughs.
                                </p>
                                <Link href="/design/1"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 w-fit"
                                    style={{ background: '#a78bfa', color: '#1a103c', boxShadow: '0 8px 20px -4px rgba(167,139,250,0.4)' }}>
                                    Enter Virtual Mode →
                                </Link>
                            </div>
                            {/* Visual */}
                            <div className="relative overflow-hidden" style={{ minHeight: '320px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/vw/vw-key-screens-08.png" alt="3D dollhouse view" className="w-full h-full object-cover object-left" />
                                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20"
                                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a78bfa' }} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>Interactive Dollhouse</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Design Styles ── */}
            <section className="section" style={{ background: 'var(--bg-overlay)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="shell">
                    <div className="section-intro left" style={{ marginBottom: '40px' }}>
                        <span className="eyebrow">Step 3</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter" style={{ letterSpacing: '-0.025em' }}>Configure finishes</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Explore professionally hand-picked palettes designed for interior spaces.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {DESIGN_STYLES.map((style, i) => (
                            <div key={style.label} className={`card-surface overflow-hidden group cursor-pointer reveal reveal-d${i + 1}`}>
                                {/* Screen trio */}
                                <div className="flex overflow-hidden" style={{ height: '160px' }}>
                                    {style.screens.slice(0, 3).map((s, j) => (
                                        <div key={j} className="flex-1 overflow-hidden relative"
                                            style={{ borderRight: j < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={s} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>{style.label}</h3>
                                        <div className="flex gap-1.5">
                                            {style.palette.map(c => (
                                                <div key={c} className="w-4 h-4 rounded-full" style={{ background: c, border: '2px solid var(--bg-elevated)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{style.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="section">
                <div className="shell">
                    <div className="rounded-2xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 reveal"
                        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', border: '1px solid rgba(37,99,235,0.25)', boxShadow: '0 20px 60px -12px rgba(37,99,235,0.25)', position: 'relative', overflow: 'hidden' }}>
                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, #3b82f6 0%, transparent 50%)' }} />
                        <div className="relative z-10 w-full md:w-2/3">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tighter leading-tight text-white" style={{ letterSpacing: '-0.025em' }}>
                                Start designing, room by room.
                            </h2>
                            <p className="text-base" style={{ color: '#bfdbfe' }}>Upload your home's photos and receive an interactive 3D model ready for material selection.</p>
                        </div>
                        <Link href="/design/1"
                            className="relative z-10 shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 shadow-xl"
                            style={{ background: 'white', color: '#1e3a8a', boxShadow: '0 8px 30px -4px rgba(255,255,255,0.3)' }}>
                            Enter Design Room →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
