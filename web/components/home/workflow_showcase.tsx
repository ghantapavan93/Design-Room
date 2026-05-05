"use client"
import * as React from 'react';
import Image from 'next/image';

const STEPS = [
    { id: 1, label: '1. Upload Photo', desc: 'Snap a picture of the property and upload it to the Design Room.' },
    { id: 2, label: '2. AI Segmentation', desc: 'Our AI instantly maps siding, roof, trim, and windows with 99% accuracy.' },
    { id: 3, label: '3. Real-Time Design', desc: 'Collaborate live. Apply real-world materials and see immediate results.' },
    { id: 4, label: '4. Export Proposal', desc: 'Generate precise measurements and stunning visual proposals in seconds.' },
];

const MEDIA = {
    exterior: {
        1: { type: 'video', src: '/demo/steps/step-1-exterior-new.mp4' },
        2: { type: 'video', src: '/demo/steps/step-2-exterior-new.mp4' },
        3: { type: 'video', src: '/demo/steps/step-3-exterior-new.mp4' },
        4: { type: 'image', src: '/demo/steps/step-4-exterior.webp' },
    },
    interior: {
        1: { type: 'video', src: '/demo/steps/step-1-interior-new.mp4' },
        2: { type: 'image', src: '/demo/steps/step-2-interior.webp' },
        3: { type: 'video', src: '/demo/steps/step-3-interior-new.mp4' },
        4: { type: 'image', src: '/demo/steps/step-4-interior.webp' },
    }
} as const;

type Mode = 'exterior' | 'interior';

export function WorkflowShowcase() {
    const [mode, setMode] = React.useState<Mode>('exterior');
    const [activeStep, setActiveStep] = React.useState(1);

    const activeMedia = MEDIA[mode][activeStep as 1 | 2 | 3 | 4];

    return (
        <section className="w-full pb-8 pt-2">
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight text-center" style={{ color: 'var(--text-primary)' }}>
                    How it works
                </h2>
                {/* Exterior / Interior Toggle */}
                <div className="glass flex items-center p-1.5 rounded-full shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
                    <button
                        onClick={() => setMode('exterior')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'exterior' ? '' : 'hover:bg-black/5 opacity-70'}`}
                        style={mode === 'exterior' ? { background: 'var(--text-primary)', color: 'var(--text-inverse)' } : { color: 'var(--text-primary)' }}
                    >
                        Exterior
                    </button>
                    <button
                        onClick={() => setMode('interior')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'interior' ? '' : 'hover:bg-black/5 opacity-70'}`}
                        style={mode === 'interior' ? { background: 'var(--text-primary)', color: 'var(--text-inverse)' } : { color: 'var(--text-primary)' }}
                    >
                        Interior
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left: Interactive Tabs */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {STEPS.map((step) => {
                        const isActive = activeStep === step.id;
                        return (
                            <div
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveStep(step.id); } }}
                                style={{
                                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                                    borderColor: isActive ? '#3b82f6' : 'transparent',
                                    boxShadow: isActive ? '0 10px 30px -10px rgba(59,130,246,0.15)' : 'none',
                                    transform: isActive ? 'translateX(8px)' : 'none'
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3
                                        className="font-bold text-lg"
                                        style={{ color: isActive ? '#3b82f6' : 'var(--text-primary)' }}
                                    >
                                        {step.label}
                                    </h3>
                                    {isActive && (
                                        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
                                    )}
                                </div>
                                <p
                                    className="text-sm leading-relaxed transition-all duration-300"
                                    style={{
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        opacity: isActive ? 1 : 0.7
                                    }}
                                >
                                    {step.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Right: Media Showcase */}
                <div className="lg:col-span-7 relative w-full flex justify-center">
                    <div
                        className="relative w-full rounded-2xl overflow-hidden glass transition-all"
                        style={{
                            aspectRatio: '16/10',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            padding: '12px',
                            background: '#1a1b1e' // Macbook screen bezel
                        }}
                    >
                        {/* Inner Screen */}
                        <div className="w-full h-full relative rounded-xl overflow-hidden bg-black">
                            {STEPS.map((step) => {
                                const mediaForStep = MEDIA[mode][step.id as 1 | 2 | 3 | 4];
                                const isVisible = activeStep === step.id;
                                return (
                                    <div
                                        key={`${mode}-${step.id}`}
                                        className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                                        style={{
                                            opacity: isVisible ? 1 : 0,
                                            pointerEvents: isVisible ? 'auto' : 'none',
                                            zIndex: isVisible ? 10 : 0
                                        }}
                                    >
                                        {mediaForStep.type === 'video' ? (
                                            <video
                                                src={mediaForStep.src}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image
                                                src={mediaForStep.src}
                                                alt={step.label}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
