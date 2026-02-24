import * as React from 'react';
import { DesignRegion, DESIGN_REGIONS } from '../../lib/regions';
import { MaterialPreset } from '../../lib/types';

type ViewMode = '2d' | '3d' | 'virtual';

// 3D angle images from Hover's 3D Designer (folder 085123)
const ANGLES_3D = [
    '/assets/3d/3D Designer 1_1.jpg',
    '/assets/3d/3D Designer 2 2 1_1.jpg',
    '/assets/3d/3D Designer 3_2.jpg',
    '/assets/3d/3D Designer 2 3_2.jpg',
];

// Virtual walkthrough screens (folder 085148)
const VW_SCREENS = [
    '/assets/vw/vw-key-screens-08.png',   // 3D dollhouse top-down
    '/assets/vw/vw-3x2-01.png',            // Interior living
    '/assets/vw/vw-3x2-02.png',            // Interior close-up
    '/assets/vw/vw-3x2-03.png',            // Interior wide
];

// Real photorealistic exterior from Hover edit desktop (folder 084945)
const REAL_EXTERIOR = '/assets/exterior/Edit exterior desktop 1_1.jpg';
const REAL_EXTERIOR_WIDE = '/assets/exterior/Edit exterior desktop 3_2.jpg';

const safeUrl = (p: string) => encodeURI(p);

interface PreviewCanvasProps {
    baseImageUrl: string;
    masksUrlPrefix: string;
    selectedMaterials: Record<DesignRegion, string>;
    presetsMap: Record<string, MaterialPreset>;
    highlightedRegion?: DesignRegion;
    pendingSuggestion?: { region: DesignRegion; preset: MaterialPreset };
}

export function PreviewCanvas({
    masksUrlPrefix,
    selectedMaterials,
    presetsMap,
    highlightedRegion,
    pendingSuggestion,
}: PreviewCanvasProps) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [images] = React.useState<Record<string, HTMLImageElement>>({});
    const [imagesLoaded, setImagesLoaded] = React.useState(false);
    const [baseReady, setBaseReady] = React.useState(false);
    const [showBefore, setShowBefore] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>('2d');
    const [canvasMode, setCanvasMode] = React.useState<'photo' | 'schematic'>('photo');
    const [angle3d, setAngle3d] = React.useState(0);
    const [vwScreen, setVwScreen] = React.useState(0);

    // drag-to-rotate state
    const dragRef = React.useRef<{ x: number; active: boolean }>({ x: 0, active: false });
    const [rotating, setRotating] = React.useState(false);

    React.useEffect(() => {
        let loadedCount = 0;
        const requiredImages = [
            { key: 'photo', url: safeUrl(REAL_EXTERIOR) },
            { key: 'schematic', url: safeUrl(`${masksUrlPrefix}/exterior_base.jpg`) },
            ...DESIGN_REGIONS.map(r => ({ key: `mask_${r}`, url: safeUrl(`${masksUrlPrefix}/mask_${r}.png`) }))
        ];
        const total = requiredImages.length;
        requiredImages.forEach(imgReq => {
            if (!images[imgReq.key]) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = imgReq.url;
                img.onload = () => {
                    loadedCount++;
                    if (imgReq.key === 'photo' || imgReq.key === 'schematic') setBaseReady(true);
                    if (loadedCount === total) setImagesLoaded(true);
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === total) setImagesLoaded(true);
                };
                images[imgReq.key] = img;
            } else {
                loadedCount++;
                if (loadedCount === total) setImagesLoaded(true);
            }
        });
    }, [masksUrlPrefix, images]);

    React.useEffect(() => {
        if (viewMode !== '2d') return;
        if (!imagesLoaded || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const baseImg = canvasMode === 'photo' ? images['photo'] : images['schematic'];
        if (!baseImg || !baseImg.naturalWidth) return;
        canvas.width = baseImg.naturalWidth;
        canvas.height = baseImg.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImg, 0, 0);
        if (!showBefore) {
            DESIGN_REGIONS.forEach(region => {
                const maskImg = images[`mask_${region}`];
                if (!maskImg || !maskImg.naturalWidth) return;
                let materialId = selectedMaterials[region];
                let isSuggestion = false;
                if (pendingSuggestion && pendingSuggestion.region === region) {
                    materialId = pendingSuggestion.preset.id;
                    isSuggestion = true;
                }
                if (materialId && presetsMap[materialId]) {
                    const hex = presetsMap[materialId].swatchHex;
                    ctx.save();
                    ctx.globalCompositeOperation = 'multiply';
                    const off = document.createElement('canvas');
                    off.width = canvas.width; off.height = canvas.height;
                    const offCtx = off.getContext('2d')!;
                    offCtx.fillStyle = hex;
                    offCtx.globalAlpha = isSuggestion ? 0.65 : 0.82;
                    offCtx.fillRect(0, 0, off.width, off.height);
                    offCtx.globalCompositeOperation = 'destination-in';
                    offCtx.drawImage(maskImg, 0, 0);
                    ctx.drawImage(off, 0, 0);
                    ctx.restore();
                }
                if (highlightedRegion === region) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'source-over';
                    const off = document.createElement('canvas');
                    off.width = canvas.width; off.height = canvas.height;
                    const offCtx = off.getContext('2d')!;
                    offCtx.fillStyle = 'rgba(255,255,80,0.35)';
                    offCtx.fillRect(0, 0, off.width, off.height);
                    offCtx.globalCompositeOperation = 'destination-in';
                    offCtx.drawImage(maskImg, 0, 0);
                    ctx.drawImage(off, 0, 0);
                    ctx.restore();
                }
            });
        }
    }, [viewMode, canvasMode, imagesLoaded, selectedMaterials, presetsMap, highlightedRegion, pendingSuggestion, images, showBefore]);

    // Drag handlers for 3D rotation
    const onMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== '3d') return;
        dragRef.current = { x: e.clientX, active: true };
        setRotating(true);
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragRef.current.active || viewMode !== '3d') return;
        const dx = e.clientX - dragRef.current.x;
        if (Math.abs(dx) > 80) {
            setAngle3d(prev => (prev + (dx > 0 ? 1 : -1) + ANGLES_3D.length) % ANGLES_3D.length);
            dragRef.current.x = e.clientX;
        }
    };
    const onMouseUp = () => { dragRef.current.active = false; setRotating(false); };

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'var(--bg-base)' }}
        >
            {/* View mode toggle — top right */}
            <div
                className="absolute top-4 right-4 z-20 glass rounded-full p-1 flex items-center gap-1"
                style={{ boxShadow: 'var(--shadow-md)' }}
            >
                {(['2d', '3d', 'virtual'] as ViewMode[]).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider"
                        style={
                            viewMode === mode
                                ? { background: 'var(--text-primary)', color: 'var(--text-inverse)' }
                                : { color: 'var(--text-muted)' }
                        }
                    >
                        {mode === 'virtual' ? 'Virtual' : mode.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* ── 2D Canvas view ── */}
            {viewMode === '2d' && (
                <div
                    className="relative w-full max-w-5xl rounded-2xl overflow-hidden"
                    style={{
                        aspectRatio: '4/3',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    {/* Real photorealistic house photo as backdrop when no backend masks */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={safeUrl(canvasMode === 'photo' ? REAL_EXTERIOR : `${masksUrlPrefix}/exterior_base.jpg`)}
                        alt="House exterior"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: baseReady ? 0 : 1, transition: 'opacity 0.5s' }}
                    />
                    {/* Loading */}
                    {!imagesLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="spinner" />
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading preview…</p>
                            </div>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ opacity: baseReady ? 1 : 0, transition: 'opacity 0.5s ease' }}
                    />

                    {/* Mode toggle — Photo vs Schematic */}
                    <div
                        className="absolute bottom-4 left-4 glass rounded-full p-1 flex items-center gap-1"
                        style={{ boxShadow: 'var(--shadow-md)' }}
                    >
                        {[['Photo mode', 'photo'], ['Schematic', 'schematic']].map(([label, val]) => (
                            <button
                                key={val}
                                onClick={() => setCanvasMode(val as 'photo' | 'schematic')}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                style={canvasMode === val
                                    ? { background: 'var(--text-primary)', color: 'var(--text-inverse)' }
                                    : { color: 'var(--text-muted)' }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Before/After toggle */}
                    <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-1.5 flex items-center gap-1 z-30 transition-all border border-white/20"
                        style={{
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
                        }}
                    >
                        {[['After', false], ['Before', true]].map(([label, val]) => (
                            <button
                                key={String(label)}
                                onClick={() => setShowBefore(val as boolean)}
                                className="px-5 py-2 rounded-full text-sm font-bold transition-all focus:outline-none tracking-wide uppercase"
                                style={showBefore === val
                                    ? { background: 'white', color: 'black', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }
                                    : { color: 'rgba(255,255,255,0.7)' }}
                            >
                                {String(label)}
                            </button>
                        ))}
                    </div>

                    {/* Suggestion pill */}
                    {pendingSuggestion && (
                        <div
                            className="absolute top-4 left-1/2 -translate-x-1/2 glass-light rounded-full px-4 py-2 flex items-center gap-2.5 animate-fade-up"
                            style={{ border: '1px solid rgba(96,165,250,0.2)' }}
                        >
                            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#60a5fa' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                Suggestion preview — <span className="capitalize" style={{ color: '#93c5fd' }}>{pendingSuggestion.region}</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── 3D Exterior view ── */}
            {viewMode === '3d' && (
                <div
                    className="relative w-full max-w-5xl rounded-2xl overflow-hidden select-none"
                    style={{
                        aspectRatio: '4/3',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-subtle)',
                        cursor: rotating ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <img
                        key={ANGLES_3D[angle3d]}
                        src={safeUrl(ANGLES_3D[angle3d])}
                        alt={`3D view angle ${angle3d + 1}`}
                        className="w-full h-full object-cover"
                        style={{ transition: 'opacity 0.2s ease' }}
                        draggable={false}
                    />

                    {/* Angle dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {ANGLES_3D.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setAngle3d(i); }}
                                className="w-2 h-2 rounded-full transition-all"
                                style={{ background: i === angle3d ? 'var(--text-primary)' : 'var(--text-muted)', opacity: i === angle3d ? 1 : 0.4 }}
                            />
                        ))}
                    </div>

                    {/* Rotate hint */}
                    <div
                        className="absolute top-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 flex items-center gap-2"
                        style={{ pointerEvents: 'none' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Drag to rotate</span>
                    </div>
                </div>
            )}

            {/* ── Virtual Walkthrough view ── */}
            {viewMode === 'virtual' && (
                <div
                    className="relative w-full max-w-5xl rounded-2xl overflow-hidden"
                    style={{
                        aspectRatio: '4/3',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-subtle)',
                    }}
                >
                    <img
                        key={VW_SCREENS[vwScreen]}
                        src={safeUrl(VW_SCREENS[vwScreen])}
                        alt={`Virtual walkthrough screen ${vwScreen + 1}`}
                        className="w-full h-full object-cover"
                        style={{ transition: 'opacity 0.3s ease' }}
                    />

                    {/* Mode label */}
                    <div className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2">
                        <span
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: vwScreen === 0 ? '#60a5fa' : 'var(--text-primary)' }}
                        >
                            {vwScreen === 0 ? '3D Dollhouse' : 'Virtual Tour'}
                        </span>
                    </div>

                    {/* Navigation buttons */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {['Dollhouse', 'Living', 'Detail', 'Wide'].map((label, i) => (
                            <button
                                key={i}
                                onClick={() => setVwScreen(i)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all glass"
                                style={
                                    i === vwScreen
                                        ? { background: 'var(--text-primary)', color: 'var(--text-inverse)', border: 'none' }
                                        : { color: 'var(--text-muted)' }
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Prev/Next arrows */}
                    {vwScreen > 0 && (
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 glass w-10 h-10 rounded-full flex items-center justify-center"
                            onClick={() => setVwScreen(v => Math.max(0, v - 1))}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    )}
                    {vwScreen < VW_SCREENS.length - 1 && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 glass w-10 h-10 rounded-full flex items-center justify-center"
                            onClick={() => setVwScreen(v => Math.min(VW_SCREENS.length - 1, v + 1))}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    )}
                </div>
            )}

            {/* Mode description row */}
            <div className="mt-4 flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {viewMode === '2d' && 'High-resolution exterior with material overlays'}
                    {viewMode === '3d' && 'Photorealistic 3D render — drag to rotate between angles'}
                    {viewMode === 'virtual' && 'Virtual walkthrough — explore every room'}
                </span>
            </div>
        </div>
    );
}
