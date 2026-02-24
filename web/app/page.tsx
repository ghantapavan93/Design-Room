"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AddPhotoModal } from '@/components/design/add_photo_modal';
import Image from 'next/image';

export default function Home() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [sliderX, setSliderX] = React.useState(50); // percent
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const handleCreate = async (file: File) => {
        router.push(`/design/1`);
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
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--text-primary)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--text-inverse)" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Design Room</span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="/ideas" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>Ideas</a>
                    <a href="/interiors" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>Interiors</a>
                    <a
                        href="/design/1"
                        className="pill"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                    >
                        View Demo
                    </a>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="pill"
                        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 600 }}
                    >
                        Start designing →
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <main className="pt-20 flex flex-col">
                {/* Hero text */}
                <section className="text-center pt-20 pb-12 px-4">
                    <div className="pill mx-auto mb-5" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--accent)' }} />
                        Real-time design wins
                    </div>
                    <h1
                        className="text-6xl font-bold tracking-tight leading-none mb-5"
                        style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
                    >
                        Visualize. Decide.<br />Win the job.
                    </h1>
                    <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        Design Room turns contractor–homeowner sessions into structured decisions with real-time material visualization, version history, and a collaborative design ledger.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-3.5 rounded-full font-semibold text-base transition-all"
                            style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                        >
                            Upload a photo →
                        </button>
                        <a
                            href="/design/1"
                            className="px-8 py-3.5 rounded-full font-semibold text-base transition-all"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                        >
                            See live demo
                        </a>
                    </div>
                </section>

                {/* ── Before/After Slider ── */}
                <section className="relative max-w-6xl mx-auto w-full px-4 mb-16">
                    <div
                        ref={sliderRef}
                        className="relative w-full aspect-video rounded-2xl overflow-hidden select-none cursor-ew-resize"
                        style={{ boxShadow: 'var(--shadow-lg)' }}
                        onMouseDown={handleMouseDown}
                    >
                        {/* After image (base) — using real homeowner design photo */}
                        <Image
                            src="/assets/hero/homeowner-4x3-02-hover-design.webp"
                            alt="After Design"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Before image (clipped) */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}
                        >
                            <Image
                                src="/assets/hero/homeowner-4x3-01-before.webp"
                                alt="Before"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Slider handle */}
                        <div
                            className="absolute top-0 bottom-0 z-10"
                            style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: 'white' }} />
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: 'white', boxShadow: 'var(--shadow-md)' }}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#0c0c0d" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                                </svg>
                            </div>
                        </div>
                        {/* Labels */}
                        <div className="absolute top-4 left-4 pill glass text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Before</div>
                        <div className="absolute top-4 right-4 pill glass text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>After · AI Design</div>
                    </div>
                    <p className="text-center text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                        ← Drag to compare before and after
                    </p>
                </section>

                {/* ── Role photo feature tiles — using real about-*.webp assets ── */}
                <section className="max-w-6xl mx-auto w-full px-4 pb-16">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            {
                                photo: '/assets/hero/about-homeowner.webp',
                                role: 'Homeowner',
                                title: 'See it before you build it.',
                                body: 'Upload your home photo, choose colours and materials, and see the result live — no guesswork.',
                                href: '/design/1',
                                cta: 'Start designing →',
                                accent: '#60a5fa',
                            },
                            {
                                photo: '/assets/hero/about-construction-pro.webp',
                                role: 'Contractor',
                                title: 'Win more bids.',
                                body: 'Present polished visual proposals in real time. Clients who can see it are clients who say yes.',
                                href: '/design/1',
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
                                accent: '#a78bfa',
                            },
                        ].map(f => (
                            <div
                                key={f.role}
                                className="rounded-2xl overflow-hidden animate-fade-up group hover:scale-[1.01] transition-transform cursor-pointer"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}
                            >
                                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                    <Image
                                        src={f.photo}
                                        alt={f.role}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                                    <div className="absolute bottom-3 left-4">
                                        <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: `${f.accent}22`, color: f.accent, border: `1px solid ${f.accent}44` }}>
                                            {f.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.body}</p>
                                    <a href={f.href} className="text-xs font-semibold" style={{ color: f.accent }}>{f.cta}</a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Extra Hover asset showcase strip */}
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="rounded-2xl overflow-hidden relative group cursor-pointer hover:scale-[1.01] transition-transform"
                            style={{ aspectRatio: '3/2', border: '1px solid var(--border-subtle)' }}
                        >
                            <Image src="/assets/hero/homeowner-4x3-design-from-every-angle.webp" alt="Design from every angle" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                            <div className="absolute bottom-4 left-5">
                                <p className="text-base font-bold" style={{ color: 'white' }}>Design from every angle</p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>3D exterior · Virtual walkthrough</p>
                            </div>
                        </div>
                        <div
                            className="rounded-2xl overflow-hidden relative group cursor-pointer hover:scale-[1.01] transition-transform"
                            style={{ aspectRatio: '3/2', border: '1px solid var(--border-subtle)' }}
                        >
                            <Image src="/assets/hero/homeowner-4x3-designs-you-can-build.webp" alt="Designs you can build" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                            <div className="absolute bottom-4 left-5">
                                <p className="text-base font-bold" style={{ color: 'white' }}>Designs you can actually build</p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Real materials · Real contractors</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="w-full text-center pb-8 pt-4">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Demo project. Visuals are placeholder assets.</p>
                </footer>
            </main>

            <AddPhotoModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onPhotoSelected={handleCreate}
            />
        </div>
    );
}
