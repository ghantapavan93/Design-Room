"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AddPhotoModal } from '@/components/design/add_photo_modal';
import { WorkflowShowcase } from '@/components/home/workflow_showcase';
import Image from 'next/image';

export default function Home() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [sliderX, setSliderX] = React.useState(50);
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const handleCreate = async (_file: File) => {
        router.push(`/projects`);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    };
    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
        setSliderX(x);
    }, [isDragging]);
    const handleMouseUp = React.useCallback(() => setIsDragging(false), []);

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

            {/* ── Top nav ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="shell flex items-center justify-between h-[60px]">
                    <a href="/" className="flex items-center gap-2.5 no-underline">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'var(--text-primary)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Design Room</span>
                    </a>

                    <div className="hidden md:flex items-center gap-6">
                        <a href="/ideas" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                            Ideas
                        </a>
                        <a href="/interiors" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                            Interiors
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <a href="/projects" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-full transition-colors"
                            style={{ color: 'var(--text-secondary)', background: 'var(--bg-overlay)', border: '1px solid var(--border-default)' }}>
                            View Demo
                        </a>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-sm font-semibold px-4 py-2 rounded-full transition-all hover:-translate-y-0.5"
                            style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}>
                            Start designing →
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex flex-col w-full pt-[60px]">

                {/* ── Hero ── */}
                <section className="section-sm" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
                    <div className="shell grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Left: Copy */}
                        <div className="flex flex-col items-start reveal">
                            <span className="eyebrow mb-5">
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
                                Real-time collaborative design
                            </span>

                            <h1 className="text-4xl md:text-5xl lg:text-[58px] font-extrabold tracking-tighter leading-[1.08] mb-5"
                                style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                Visualize.{' '}
                                <span style={{ color: 'var(--text-secondary)' }}>Decide.</span><br />
                                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}>
                                    Win the job.
                                </span>
                            </h1>

                            <p className="text-base md:text-lg mb-8 max-w-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                Transform exterior photos into fully interactive design sessions.
                                Apply real materials, collaborate live, and export a polished proposal — all before ground breaks.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg"
                                    style={{ background: '#2563eb', color: 'white', boxShadow: '0 8px 24px -4px rgba(37,99,235,0.4)' }}
                                    onMouseOver={e => (e.currentTarget.style.background = '#1d4ed8')}
                                    onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}>
                                    Start designing for free →
                                </button>
                                <a href="/projects"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
                                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                                    View live demo
                                </a>
                            </div>

                            {/* Proof bar */}
                            <div className="flex items-center gap-5 mt-8 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                {[
                                    { value: '99%', label: 'AI Accuracy' },
                                    { value: '< 2 min', label: 'Segmentation' },
                                    { value: '3 roles', label: 'Live collab' },
                                ].map(s => (
                                    <div key={s.label} className="flex flex-col gap-0.5">
                                        <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{s.value}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Before/After Stage */}
                        <div className="relative w-full reveal reveal-d1">
                            <div className="stage-frame select-none cursor-ew-resize"
                                ref={sliderRef}
                                style={{ aspectRatio: '4/3' }}
                                onMouseDown={handleMouseDown}
                                onTouchStart={() => setIsDragging(true)}
                                onTouchMove={(e) => {
                                    if (!sliderRef.current) return;
                                    const rect = sliderRef.current.getBoundingClientRect();
                                    const x = Math.max(5, Math.min(95, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
                                    setSliderX(x);
                                }}
                                onTouchEnd={() => setIsDragging(false)}>

                                {/* After image (base) */}
                                <Image src="/assets/hero/homeowner-4x3-02-hover-design.webp" alt="After AI Design" fill className="object-cover" priority />

                                {/* Before image (clipped) */}
                                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}>
                                    <Image src="/assets/hero/homeowner-4x3-01-before.webp" alt="Before" fill className="object-cover" priority />
                                </div>

                                {/* Slider handle */}
                                <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}>
                                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 12px rgba(0,0,0,0.2)' }} />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-xl border border-white/30"
                                        style={{ background: 'white', backdropFilter: 'blur(8px)' }}>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Labels */}
                                <div className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full"
                                    style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(8px)' }}>Before</div>
                                <div className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full"
                                    style={{ background: 'rgba(37,99,235,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}>After · AI Design</div>
                            </div>
                            <p className="text-center text-[10px] font-semibold uppercase tracking-widest mt-3" style={{ color: 'var(--text-muted)' }}>
                                ← Drag to compare →
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── How It Works ── */}
                <section className="section" style={{ background: 'var(--bg-overlay)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="shell">
                        <div className="section-intro">
                            <span className="eyebrow">The process</span>
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                From photo to proposal in minutes
                            </h2>
                            <p className="text-base max-w-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Four steps. No guesswork. The whole team in sync from day one.
                            </p>
                        </div>
                        <WorkflowShowcase />
                    </div>
                </section>

                {/* ── Role cards (Bento) ── */}
                <section className="section">
                    <div className="shell">
                        <div className="section-intro left">
                            <span className="eyebrow">Who it's for</span>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                                Built for every role in the project
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                            {[
                                {
                                    photo: '/assets/hero/about-homeowner.webp',
                                    role: 'Homeowner',
                                    title: 'See it before you build it.',
                                    body: 'Upload your home photo, choose colours and materials, and see the result live — no guesswork.',
                                    href: '/projects',
                                    cta: 'Start designing →',
                                    accent: '#60a5fa',
                                },
                                {
                                    photo: '/assets/hero/about-construction-pro.webp',
                                    role: 'Contractor',
                                    title: 'Win more bids.',
                                    body: 'Present polished visual proposals in real time. Clients who can see it are clients who say yes.',
                                    href: '/projects',
                                    cta: 'Open editor →',
                                    accent: '#34d399',
                                },
                                {
                                    photo: '/assets/hero/about-insurance-pro.webp',
                                    role: 'Insurance Pro',
                                    title: 'Document with precision.',
                                    body: 'Accurate 3D measurements and material records for every property — from a phone photo.',
                                    href: '/interiors',
                                    cta: 'Explore interiors →',
                                    accent: '#f59e0b',
                                },
                            ].map((f, i) => (
                                <a
                                    key={f.role}
                                    href={f.href}
                                    className={`card-surface flex flex-col group no-underline overflow-hidden reveal reveal-d${i + 1}`}
                                    style={{ textDecoration: 'none' }}>
                                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                        <Image src={f.photo} alt={f.role} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                                        <div className="absolute bottom-3 left-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full"
                                                style={{ background: `${f.accent}22`, color: f.accent, border: `1px solid ${f.accent}44`, backdropFilter: 'blur(4px)' }}>
                                                {f.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                                        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-secondary)' }}>{f.body}</p>
                                        <span className="text-xs font-bold" style={{ color: f.accent }}>{f.cta}</span>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Feature showcase — 2-up */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { src: '/assets/hero/homeowner-4x3-design-from-every-angle.webp', title: 'Design from every angle', sub: '3D exterior · Virtual walkthrough' },
                                { src: '/assets/hero/homeowner-4x3-designs-you-can-build.webp', title: 'Designs you can actually build', sub: 'Real materials · Real contractors' },
                            ].map((item, i) => (
                                <div key={item.title} className={`card-surface overflow-hidden relative group cursor-pointer reveal reveal-d${i + 4}`} style={{ aspectRatio: '16/9' }}>
                                    <Image src={item.src} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                                    <div className="absolute bottom-4 left-5">
                                        <p className="text-sm font-bold text-white mb-0.5">{item.title}</p>
                                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="shell py-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--text-primary)' }}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Design Room</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Demo project — visuals are placeholder assets.</p>
                    </div>
                </footer>
            </main>

            <AddPhotoModal open={isModalOpen} onOpenChange={setIsModalOpen} onPhotoSelected={handleCreate} />
        </div>
    );
}
