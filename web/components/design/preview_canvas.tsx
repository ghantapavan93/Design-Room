import * as React from 'react';
import { DesignRegion, DESIGN_REGIONS } from '../../lib/regions';
import { MaterialPreset, DesignElement } from '../../lib/types';

type ViewMode = 'photo' | 'schematic' | 'wireframe' | '3d' | 'virtual';

const ANGLES_3D = [
    '/assets/3d/3D Designer 1_1.jpg',
    '/assets/3d/3D Designer 2 2 1_1.jpg',
    '/assets/3d/3D Designer 3_2.jpg',
    '/assets/3d/3D Designer 2 3_2.jpg',
];

const VW_SCREENS = [
    '/assets/vw/vw-key-screens-08.png',
    '/assets/vw/vw-3x2-01.png',
    '/assets/vw/vw-3x2-02.png',
    '/assets/vw/vw-3x2-03.png',
];

const safeUrl = (p: string) => encodeURI(p);

interface PreviewCanvasProps {
    baseImageUrl: string;
    masksUrlPrefix: string;
    selectedMaterials: Record<string, string>; // Keys can be region or element ID
    presetsMap: Record<string, MaterialPreset>;
    highlightedRegion?: string;
    pendingSuggestion?: { region: string; preset: MaterialPreset };
    elements?: DesignElement[]; // New granular elements

    // Multi-select & hover UX
    selectedRegions: string[];
    onRegionClick?: (region: string, clientX: number, clientY: number, shiftKey: boolean) => void;
    onBackgroundClick?: () => void;

    // Region lock & comments
    lockedRegions?: { region: string; lockedBy: string; expiresAt?: string }[];
    commentCounts?: Record<string, number>;

    // Passivity
    passive?: boolean;
}

// Approximate center positions for region overlays (percentage of canvas)
const REGION_OVERLAY_POSITIONS: Record<string, { x: number; y: number }> = {
    roof: { x: 50, y: 22 },
    walls: { x: 38, y: 55 },
    windows: { x: 55, y: 48 },
    door: { x: 42, y: 70 },
    trim: { x: 25, y: 60 },
    garage: { x: 72, y: 60 },
};

export function PreviewCanvas({
    baseImageUrl,
    masksUrlPrefix,
    selectedMaterials,
    presetsMap,
    highlightedRegion,
    pendingSuggestion,
    selectedRegions,
    elements = [],
    onRegionClick,
    onBackgroundClick,
    lockedRegions = [],
    commentCounts = {},
    passive = false,
}: PreviewCanvasProps) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [images, setImages] = React.useState<Record<string, HTMLImageElement>>({});
    const [imagesLoaded, setImagesLoaded] = React.useState(false);
    const [baseReady, setBaseReady] = React.useState(false);

    // Interaction state
    const [viewMode, setViewMode] = React.useState<ViewMode>('photo');
    const [splitPos, setSplitPos] = React.useState<number>(1); // 1 = fully edited, 0 = fully original
    const [isDraggingSplit, setIsDraggingSplit] = React.useState(false);
    const [angle3d, setAngle3d] = React.useState(0);
    const [vwScreen, setVwScreen] = React.useState(0);
    const [outlinePulse, setOutlinePulse] = React.useState(1);

    const dragRef = React.useRef<{ x: number; active: boolean }>({ x: 0, active: false });
    const [rotating, setRotating] = React.useState(false);

    // Reusable hit-test canvas context to avoid heavy allocations during mouse movement
    const hitCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    React.useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        hitCtxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    }, []);

    // Hit-testing debug state
    const [debugInfo, setDebugInfo] = React.useState<{
        active: boolean;
        px: number; py: number; // Pointer X/Y (relative to container)
        mx: number; my: number; // Mapped X/Y (relative to mask)
        alpha: number;
        hitId: string | null;
        visible: boolean;
    }>({ active: false, px: 0, py: 0, mx: 0, my: 0, alpha: 0, hitId: null, visible: false });

    const videoRef = React.useRef<HTMLVideoElement | null>(null);

    // Pulse animation for outlines
    React.useEffect(() => {
        if (selectedRegions.length === 0) return;
        let start = performance.now();
        let raf: number;
        const animate = (time: number) => {
            const elapsed = time - start;
            // oscillate between 0.4 and 1.0 alpha for the outline
            setOutlinePulse(0.7 + Math.sin(elapsed / 250) * 0.3);
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [selectedRegions]);

    React.useEffect(() => {
        setBaseReady(false);
        setImagesLoaded(false);
        setImages({});
    }, [masksUrlPrefix, baseImageUrl]);

    React.useEffect(() => {
        const requiredImages = [
            { key: 'photo', url: safeUrl(baseImageUrl) + '?v=4' },
            { key: 'schematic', url: safeUrl(`${masksUrlPrefix}/base.jpg`) + '?v=4' },
            ...DESIGN_REGIONS.map(r => ({ key: `mask_${r}`, url: safeUrl(`${masksUrlPrefix}/mask_${r}.png`) + '?v=4' })),
            ...elements.map(e => ({ key: `elem_${e.id}`, url: safeUrl(e.maskUrl.startsWith('/') || e.maskUrl.startsWith('http') ? e.maskUrl : `${masksUrlPrefix}/${e.maskUrl}`) + '?v=4' }))
        ];

        let loadedCount = 0;
        const total = requiredImages.length;
        if (total === 0) { setImagesLoaded(true); return; }

        requiredImages.forEach(req => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = req.url;
            img.onload = () => {
                setImages(prev => ({ ...prev, [req.key]: img }));
                loadedCount++;
                if (req.key === 'photo' || req.key === 'schematic') setBaseReady(true);
                if (loadedCount === total) setImagesLoaded(true);
            };
            img.onerror = () => {
                console.error("Failed to load image:", req.url);
                loadedCount++;
                if (loadedCount === total) setImagesLoaded(true);
            };
        });
    }, [masksUrlPrefix, baseImageUrl, elements]);

    React.useEffect(() => {
        if (!(viewMode === 'photo' || viewMode === 'schematic' || viewMode === 'wireframe')) return;
        if (!imagesLoaded || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Determine base image to draw
        let baseImgKey = 'photo';
        if (viewMode === 'schematic' || viewMode === 'wireframe') {
            baseImgKey = 'schematic';
        }
        const baseImg = images[baseImgKey];
        if (!baseImg || !baseImg.naturalWidth) return;

        canvas.width = baseImg.naturalWidth;
        canvas.height = baseImg.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply filters based on viewMode
        if (viewMode === 'schematic' || viewMode === 'wireframe') {
            ctx.filter = 'grayscale(100%) contrast(300%) brightness(1.5) invert(0%)';
        } else {
            ctx.filter = 'none';
        }

        // Handle Video Base Image
        const isVideo = baseImageUrl.toLowerCase().endsWith('.mp4') || baseImageUrl.toLowerCase().endsWith('.webm');
        if (isVideo && viewMode === 'photo') {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            }
        } else {
            ctx.drawImage(baseImg, 0, 0);
        }

        ctx.filter = 'none'; // Reset filter for subsequent draws

        // Apply clip for comparison slider
        ctx.save();
        ctx.beginPath();
        // The edited portion is drawn on the LEFT side of the split, original on RIGHT
        ctx.rect(0, 0, canvas.width * splitPos, canvas.height);
        ctx.clip();

        // Unify bulk regions and explicit elements for rendering
        // Filter out bulk regions if we have granular elements for that category to avoid "double-masking"
        const elementCategories = new Set(elements.map(e => e.groupKey || e.id.split('_')[0]));
        const renderTargets = [
            ...DESIGN_REGIONS.filter(r => !elementCategories.has(r)).map(r => ({ id: r, key: `mask_${r}`, isElement: false })),
            ...elements.map(e => ({ id: e.id, key: `elem_${e.id}`, isElement: true, groupKey: e.groupKey }))
        ];

        // PASS 1: Material Tints (Bottom Layer)
        renderTargets.forEach(target => {
            if (viewMode === 'wireframe') return;
            const maskImg = images[target.key];
            if (!maskImg || !maskImg.naturalWidth) return;

            const getMaterialId = () => {
                if (selectedMaterials[target.id]) return selectedMaterials[target.id];
                // @ts-ignore
                if (target.isElement && target.groupKey && selectedMaterials[target.groupKey]) return selectedMaterials[target.groupKey];
                const base = target.id.split('_')[0];
                if (base === 'window' && selectedMaterials['windows']) return selectedMaterials['windows'];
                if (base === 'windows' && selectedMaterials['window']) return selectedMaterials['window'];
                return undefined;
            };

            let materialId = getMaterialId();
            if (pendingSuggestion && pendingSuggestion.region === target.id) materialId = pendingSuggestion.preset.id;

            if (materialId && presetsMap[materialId]) {
                const preset = presetsMap[materialId];
                const hex = preset.swatchHex;

                const off = document.createElement('canvas');
                off.width = canvas.width; off.height = canvas.height;
                const offCtx = off.getContext('2d')!;
                offCtx.fillStyle = hex;
                offCtx.fillRect(0, 0, off.width, off.height);
                offCtx.globalCompositeOperation = 'destination-in';
                offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

                // BEFORE/AFTER LOGIC: Determine if this region is currently being focused
                const tAny = target as any;
                const isSelected = selectedRegions.includes(target.id) ||
                    (tAny.groupKey && selectedRegions.includes(tAny.groupKey)) ||
                    (target.id.startsWith('window_') && selectedRegions.includes('windows')) ||
                    (target.id === 'windows' && selectedRegions.includes('window'));
                const isChanged = (pendingSuggestion && pendingSuggestion.region === target.id);

                // BOLD REALISM RENDERING: Ensure color is visible on ANY background
                ctx.save();
                ctx.globalAlpha = isSelected || isChanged ? 0.85 : 0.60;

                // 1. Solid Color Base
                ctx.drawImage(off, 0, 0);

                // 2. Texture Overlay: Draw the base image back on top with 'multiply' to keep shadows/texture
                const baseImg = viewMode === 'photo' ? images['photo'] : images['schematic'];
                if (baseImg) {
                    const tex = document.createElement('canvas');
                    tex.width = canvas.width; tex.height = canvas.height;
                    const texCtx = tex.getContext('2d')!;
                    texCtx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
                    texCtx.globalCompositeOperation = 'destination-in';
                    texCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

                    ctx.globalCompositeOperation = 'multiply';
                    ctx.globalAlpha = 0.5; // Subtle texture drape
                    ctx.drawImage(tex, 0, 0);
                }
                ctx.restore();
            }
        });

        // PASS 2: UI Overlays (Top Layer)
        renderTargets.forEach(target => {
            const maskImg = images[target.key];
            if (!maskImg || !maskImg.naturalWidth) return;

            const isSelected = selectedRegions.includes(target.id);
            const isHighlighted = highlightedRegion === target.id;

            // 1. Solid Blue Pulsed Outline
            if (isSelected) {
                ctx.save();
                const off = document.createElement('canvas');
                off.width = canvas.width; off.height = canvas.height;
                const offCtx = off.getContext('2d')!;

                // Thick solid outline via octagonal offset
                offCtx.globalCompositeOperation = 'source-over';
                const offset = 3;
                [
                    [0, -offset], [0, offset], [-offset, 0], [offset, 0],
                    [-offset, -offset], [offset, offset], [-offset, offset], [offset, -offset]
                ].forEach(([dx, dy]) => offCtx.drawImage(maskImg, dx, dy, canvas.width, canvas.height));

                // Pulsing color pass
                offCtx.globalCompositeOperation = 'source-in';
                const pulse = 0.8 + (Math.sin(outlinePulse * Math.PI * 2) * 0.15);
                offCtx.fillStyle = `rgba(59, 130, 246, ${pulse})`;
                offCtx.fillRect(0, 0, off.width, off.height);

                // Punch out center to reveal image beneath
                offCtx.globalCompositeOperation = 'destination-out';
                offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

                ctx.drawImage(off, 0, 0);
                ctx.restore();
            }

            // 2. Yellow Hover highlight
            if (isHighlighted && !isSelected) {
                ctx.save();
                const off = document.createElement('canvas');
                off.width = canvas.width; off.height = canvas.height;
                const offCtx = off.getContext('2d')!;
                offCtx.fillStyle = 'rgba(255, 255, 100, 0.1)'; // Tactile hover feedback
                offCtx.fillRect(0, 0, off.width, off.height);
                offCtx.globalCompositeOperation = 'destination-in';
                offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
                ctx.drawImage(off, 0, 0);
                ctx.restore();
            }

            // 3. Wireframe Pass
            if (viewMode === 'wireframe') {
                ctx.save();
                const off = document.createElement('canvas');
                off.width = canvas.width; off.height = canvas.height;
                const offCtx = off.getContext('2d')!;
                offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
                offCtx.globalCompositeOperation = 'source-over';
                const wOff = 1;
                offCtx.drawImage(maskImg, -wOff, 0, canvas.width, canvas.height);
                offCtx.drawImage(maskImg, wOff, 0, canvas.width, canvas.height);
                offCtx.drawImage(maskImg, 0, -wOff, canvas.width, canvas.height);
                offCtx.drawImage(maskImg, 0, wOff, canvas.width, canvas.height);
                offCtx.globalCompositeOperation = 'source-in';
                offCtx.fillStyle = isSelected ? '#3b82f6' : (isHighlighted ? '#94a3b8' : '#cbd5e1');
                offCtx.fillRect(0, 0, off.width, off.height);
                offCtx.globalCompositeOperation = 'destination-out';
                offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = isSelected ? 1.0 : 0.5;
                ctx.drawImage(off, 0, 0);
                ctx.restore();
            }
        });

        ctx.restore(); // Restore from clipping path
    }, [viewMode, imagesLoaded, selectedMaterials, presetsMap, highlightedRegion, pendingSuggestion, images, splitPos, selectedRegions, outlinePulse, elements]);

    // Video frame loop
    React.useEffect(() => {
        const isVideo = baseImageUrl.toLowerCase().endsWith('.mp4') || baseImageUrl.toLowerCase().endsWith('.webm');
        if (!isVideo || viewMode !== 'photo') return; // Only play video in 'photo' viewMode

        if (!videoRef.current) {
            const vid = document.createElement('video');
            vid.src = safeUrl(baseImageUrl);
            vid.crossOrigin = 'anonymous';
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.play().catch(e => console.error("Video autoplay blocked:", e));
            videoRef.current = vid;

            vid.onloadeddata = () => {
                setBaseReady(true);
                setImagesLoaded(true);
            };
        }

        let rafId: number;
        const renderFrame = () => {
            // Force a re-render of the canvas by slightly updating pulse state or calling a separate draw function
            // An easy hack to trigger the effect block above is to use a separate forceRender state
            // But since outlinePulse already triggers ~60fps, we don't strictly *need* another loop if pulse is active.
            // To be safe when nothing is selected, we'll force update manually:
            if (videoRef.current && canvasRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                // We'll update outlinePulse slightly just to trigger the main effect
                setOutlinePulse(p => p === 1 ? 0.999 : 1);
            }
            rafId = requestAnimationFrame(renderFrame);
        };
        rafId = requestAnimationFrame(renderFrame);

        return () => {
            cancelAnimationFrame(rafId);
            if (videoRef.current) {
                videoRef.current.pause();
            }
        };
    }, [viewMode]);

    const getCoordinateMap = (eClientX: number, eClientY: number, baseImg: HTMLImageElement) => {
        if (!containerRef.current) return null;
        const rect = containerRef.current.getBoundingClientRect();

        const containerWidth = rect.width;
        const containerHeight = rect.height;
        const imgWidth = baseImg.naturalWidth;
        const imgHeight = baseImg.naturalHeight;

        const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
        const renderedWidth = imgWidth * scale;
        const renderedHeight = imgHeight * scale;

        const offsetX = (containerWidth - renderedWidth) / 2;
        const offsetY = (containerHeight - renderedHeight) / 2;

        const clickX = eClientX - rect.left;
        const clickY = eClientY - rect.top;

        if (clickX < offsetX || clickX > offsetX + renderedWidth ||
            clickY < offsetY || clickY > offsetY + renderedHeight) {
            return null; // out of bounds
        }

        const x = (clickX - offsetX) * (imgWidth / renderedWidth);
        const y = (clickY - offsetY) * (imgHeight / renderedHeight);

        return { x, y, clickX, clickY, imgWidth, imgHeight };
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!imagesLoaded || !canvasRef.current || (viewMode === '3d' || viewMode === 'virtual')) return;
        const baseImg = viewMode === 'photo' ? images['photo'] : images['schematic'];
        if (!baseImg) return;

        const coords = getCoordinateMap(e.clientX, e.clientY, baseImg);
        if (!coords) {
            if (onBackgroundClick) onBackgroundClick();
            return;
        }

        const { x, y, imgWidth, imgHeight } = coords;

        // Pixel-perfect hit detection
        const hitCtx = hitCtxRef.current;
        if (!hitCtx) return;
        // hitCtx.canvas.width = 1; // Already set in useEffect
        // hitCtx.canvas.height = 1; // Already set in useEffect

        let hitRegion: string | null = null;

        // Check explicit elements first (sorted by their `sortOrder` or just default order)
        const checkTargets = [
            ...elements.map(e => ({ id: e.id, key: `elem_${e.id}` })),
            ...DESIGN_REGIONS.map(r => ({ id: r, key: `mask_${r}` }))
        ];

        for (const target of checkTargets) {
            const maskImg = images[target.key];
            if (maskImg && maskImg.naturalWidth) {
                hitCtx.clearRect(0, 0, 1, 1);

                // Scale hit mapping to natural image dimensions using actual target dimensions
                const mw = maskImg.naturalWidth;
                const mh = maskImg.naturalHeight;

                const mx = (x / baseImg.naturalWidth) * mw;
                const my = (y / baseImg.naturalHeight) * mh;

                hitCtx.imageSmoothingEnabled = false;
                hitCtx.drawImage(maskImg, -Math.floor(mx), -Math.floor(my));

                const data = hitCtx.getImageData(0, 0, 1, 1).data;
                if (data[3] > 0) { // Alpha > 0 means it's a hit
                    hitRegion = target.id;
                    break;
                }
            }
        }

        // Block clicks on locked regions
        if (hitRegion && lockedRegions.some(l => l.region === hitRegion)) {
            return; // ignore
        }

        if (hitRegion && onRegionClick) {
            onRegionClick(hitRegion, e.clientX, e.clientY, e.shiftKey);
        } else if (!hitRegion && debugInfo.visible) {
            // Position-based fallback: only active in debug mode to avoid misleading
            // "why did that region select?" moments during demo.
            const pctY = (y / imgHeight) * 100;
            const pctX = (x / imgWidth) * 100;
            let fallbackRegion = 'walls'; // default
            if (pctY < 35) {
                fallbackRegion = 'roof';
            } else if (pctY > 70 && pctX > 55) {
                fallbackRegion = 'garage';
            } else if (pctY > 60 && pctX > 35 && pctX < 55) {
                fallbackRegion = 'door';
            } else if (pctY > 30 && pctY < 60) {
                fallbackRegion = 'walls';
            } else {
                fallbackRegion = 'walls';
            }
            if (onRegionClick) {
                onRegionClick(fallbackRegion, e.clientX, e.clientY, e.shiftKey);
            }
        } else if (!hitRegion && onBackgroundClick) {
            onBackgroundClick();
        }
    };

    // Document-level drag for the before/after slider — fast, never lost
    React.useEffect(() => {
        if (!isDraggingSplit) return;
        const onMove = (e: MouseEvent | TouchEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
            if (clientX === undefined) return;
            let newPos = (clientX - rect.left) / rect.width;
            newPos = Math.max(0.02, Math.min(0.98, newPos));
            setSplitPos(newPos);
        };
        const onUp = () => setIsDraggingSplit(false);
        document.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('touchend', onUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDraggingSplit]);

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const clientX = e.clientX ?? (e as any).touches?.[0]?.clientX;
        const clientY = e.clientY ?? (e as any).touches?.[0]?.clientY;

        // Skip hit-testing while dragging the slider
        if (isDraggingSplit) return;

        if (!debugInfo.visible || !imagesLoaded || !canvasRef.current || (viewMode === '3d' || viewMode === 'virtual')) return;
        const canvas = canvasRef.current;
        const baseImg = viewMode === 'photo' ? images['photo'] : images['schematic'];
        if (!baseImg) return;

        const coords = getCoordinateMap(clientX, clientY, baseImg);

        if (!coords) {
            setDebugInfo(prev => ({ ...prev, active: false }));
            return;
        }

        const { x, y, clickX, clickY } = coords;

        const hitCtx = hitCtxRef.current;
        if (!hitCtx) return;

        let hitRegion: string | null = null;
        let lastAlpha = 0;
        let matchedMaskWidth = images['mask_walls']?.naturalWidth || 640;
        let matchedMaskHeight = images['mask_walls']?.naturalHeight || 640;

        const checkTargets = [
            ...elements.map(e => ({ id: e.id, key: `elem_${e.id}` })),
            ...DESIGN_REGIONS.map(r => ({ id: r, key: `mask_${r}` }))
        ];

        for (const target of checkTargets) {
            const maskImg = images[target.key];
            if (maskImg && maskImg.naturalWidth) {
                hitCtx.clearRect(0, 0, 1, 1);

                const mw = maskImg.naturalWidth;
                const mh = maskImg.naturalHeight;

                const mx = (x / baseImg.naturalWidth) * mw;
                const my = (y / baseImg.naturalHeight) * mh;

                hitCtx.imageSmoothingEnabled = false;
                hitCtx.drawImage(maskImg, -Math.floor(mx), -Math.floor(my));

                const data = hitCtx.getImageData(0, 0, 1, 1).data;
                lastAlpha = data[3];
                if (data[3] > 0) {
                    hitRegion = target.id;
                    matchedMaskWidth = mw;
                    matchedMaskHeight = mh;
                    break;
                }
            }
        }

        setDebugInfo(prev => ({
            ...prev,
            active: true,
            px: clickX, py: clickY,
            mx: coords ? Math.floor((x / baseImg.naturalWidth) * matchedMaskWidth) : 0,
            my: coords ? Math.floor((y / baseImg.naturalHeight) * matchedMaskHeight) : 0,
            alpha: lastAlpha,
            hitId: hitRegion
        }));
    };

    const handleCanvasMouseLeave = () => {
        setDebugInfo(prev => ({ ...prev, active: false }));
        setIsDraggingSplit(false);
    };

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
    const onMouseUp = () => { dragRef.current.active = false; setRotating(false); setIsDraggingSplit(false); };

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, var(--bg-overlay) 0%, var(--bg-base) 100%)' }}
        >
            {/* Top Right Tool Cluster */}
            {!passive && (
                <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-3 pointer-events-none">
                    {/* Consolidated View Toggles */}
                    <div
                        className="glass rounded-full p-1.5 flex items-center pointer-events-auto shadow-md"
                        style={{ border: '1px solid var(--border-subtle)' }}
                    >
                        <button
                            onClick={() => setSplitPos(p => p < 1 ? 1 : 0.5)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest ${splitPos < 1 ? 'bg-blue-50 text-blue-600' : 'text-neutral-500 hover:text-neutral-800 hover:bg-black/5 active:bg-black/10'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Before / After
                        </button>

                        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

                        {/* View Modes Dropdown */}
                        <div className="relative group mx-1">
                            <button className="flex justify-center items-center gap-1.5 px-3 h-8 rounded-full text-[10px] font-bold transition-all text-neutral-600 hover:bg-neutral-100 uppercase tracking-wider">
                                <span>{viewMode === 'photo' ? 'Photo' : viewMode === 'schematic' ? 'Schematic' : viewMode === 'wireframe' ? 'Wireframe' : viewMode === '3d' ? '3D' : 'Virtual'}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </button>
                            <div className="absolute top-10 right-0 w-48 glass rounded-2xl p-2 flex-col gap-1 hidden group-hover:flex shadow-2xl border border-white/20 animate-fade-up">
                                <button onClick={() => setViewMode('photo')} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider ${viewMode === 'photo' ? 'bg-blue-50 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}>Photo View</button>
                                <button onClick={() => setViewMode('schematic')} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider ${viewMode === 'schematic' ? 'bg-blue-50 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}>Schematic View</button>
                                <button onClick={() => setViewMode('wireframe')} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider ${viewMode === 'wireframe' ? 'bg-blue-50 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}>Wireframe</button>
                                <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                                <button onClick={() => setViewMode('3d')} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider flex justify-between items-center ${viewMode === '3d' ? 'bg-blue-50 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                                    3D Model <span className="text-emerald-500 font-medium">Beta</span>
                                </button>
                                <button onClick={() => setViewMode('virtual')} className={`w-full text-left px-3 py-2 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider ${viewMode === 'virtual' ? 'bg-blue-50 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}>Virtual Walk</button>
                                <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                                <button onClick={() => setDebugInfo(p => ({ ...p, visible: !p.visible }))} className="w-full text-left px-3 py-2 text-[10px] font-bold text-rose-500 rounded-lg hover:bg-rose-50 transition-colors uppercase tracking-wider flex justify-between items-center">
                                    Toggle Debug {debugInfo.visible && <span className="text-[8px] bg-rose-100 px-1 rounded">ON</span>}
                                </button>
                            </div>
                        </div>
                    </div >
                </div >
            )}

            {/* ── 2D Canvas view ── */}
            {
                (viewMode === 'photo' || viewMode === 'schematic' || viewMode === 'wireframe') && (
                    <div
                        className="relative w-full max-w-6xl rounded-[32px] overflow-hidden"
                        style={{
                            aspectRatio: '4/3',
                            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'black' // prevent harsh white bars if letterboxing
                        }}
                        ref={containerRef}
                    >
                        {/* Base image: visible as "BEFORE" photo when slider is active, otherwise hidden behind canvas */}
                        {!(baseImageUrl.toLowerCase().endsWith('.mp4') || baseImageUrl.toLowerCase().endsWith('.webm')) && (
                            <img
                                src={safeUrl((viewMode === 'schematic' || viewMode === 'wireframe') ? `${masksUrlPrefix}/base.jpg` : baseImageUrl) + '?v=4'}
                                alt="House exterior"
                                className="absolute inset-0 w-full h-full object-contain"
                                style={{
                                    opacity: baseReady ? (splitPos < 1 ? 1 : 0) : 1,
                                    transition: 'opacity 0.3s',
                                    filter: (viewMode === 'schematic' || viewMode === 'wireframe') ? 'grayscale(100%) contrast(110%) brightness(1.1) opacity(70%)' : 'none',
                                    zIndex: 0
                                }}
                            />
                        )}

                        {(viewMode === 'photo' || viewMode === 'schematic' || viewMode === 'wireframe') && !imagesLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="spinner" />
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading preview…</p>
                                </div>
                            </div>
                        )}
                        <canvas
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className="absolute inset-0 w-full h-full object-contain cursor-crosshair pointer-events-auto"
                            style={{ opacity: baseReady ? 1 : 0, transition: 'opacity 0.5s ease' }}
                        />

                        {/* Compare Slider Handle — wide grab area for easy dragging */}
                        {splitPos < 1 && (
                            <div
                                className="absolute top-0 bottom-0 z-20 cursor-col-resize group"
                                style={{ left: `${splitPos * 100}%`, transform: 'translateX(-50%)', width: '48px' }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingSplit(true); }}
                                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingSplit(true); }}
                            >
                                {/* Visible white line */}
                                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-white" style={{ boxShadow: '0 0 12px rgba(0,0,0,0.6), 0 0 4px rgba(0,0,0,0.3)' }} />
                                {/* Labels */}
                                <div className="absolute top-3 right-full mr-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap pointer-events-none">After</div>
                                <div className="absolute top-3 left-full ml-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap pointer-events-none">Before</div>
                                {/* Circle handle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-xl flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.25), 0 0 0 2px rgba(255,255,255,0.8)' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-600">
                                        <path d="M8 9l-4 3 4 3M16 15l4-3-4-3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Hit-Testing Debug Overlay */}
                        {debugInfo.visible && debugInfo.active && (
                            <>
                                {/* Pointer Dot */}
                                <div
                                    className="absolute w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: debugInfo.px, top: debugInfo.py }}
                                />
                                {/* Info Box */}
                                <div
                                    className="absolute bg-slate-900/90 backdrop-blur text-white text-[10px] font-mono p-2 rounded-lg shadow-xl pointer-events-none z-50 w-48 border border-slate-700/50"
                                    style={{
                                        left: debugInfo.px + 16,
                                        top: debugInfo.py + 16,
                                        // Keep it on screen
                                        transform: `translate(${debugInfo.px > 800 ? '-120%' : '0'}, ${debugInfo.py > 500 ? '-120%' : '0'})`
                                    }}
                                >
                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                                        <span className="text-slate-400">Screen</span>
                                        <span>{Math.round(debugInfo.px)}, {Math.round(debugInfo.py)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                                        <span className="text-slate-400">Mask Map</span>
                                        <span>{debugInfo.mx}, {debugInfo.my}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                                        <span className="text-slate-400">Alpha Raw</span>
                                        <span className={debugInfo.alpha > 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>{debugInfo.alpha}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Hit ID</span>
                                        <span className={debugInfo.hitId ? "text-blue-400 font-bold" : "text-slate-500"}>{debugInfo.hitId || 'none'}</span>
                                    </div>
                                </div>
                            </>
                        )}



                        {pendingSuggestion && (
                            <div
                                className="absolute top-4 left-1/2 -translate-x-1/2 glass-light rounded-full px-4 py-2 flex items-center gap-2.5 animate-fade-up pointer-events-none"
                                style={{ border: '1px solid rgba(96,165,250,0.2)' }}
                            >
                                <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#60a5fa' }} />
                                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Suggestion preview — <span className="capitalize" style={{ color: '#93c5fd' }}>{pendingSuggestion.region.replace('_', ' ')}</span>
                                </p>
                            </div>
                        )}

                        {/* Lock icons & comment badges */}
                        {[...DESIGN_REGIONS, ...elements.map(e => e.id)].map(region => {
                            // For elements, fallback to group pos if no explicit pos
                            const baseGroup = elements.find(e => e.id === region)?.groupKey || region;
                            const pos = REGION_OVERLAY_POSITIONS[baseGroup];
                            if (!pos) return null;
                            const lockInfo = lockedRegions.find(l => l.region === region);
                            const isLocked = !!lockInfo;
                            const commentCount = commentCounts[region] || 0;
                            if (!isLocked && commentCount === 0) return null;

                            return (
                                <div
                                    key={`overlay-${region}`}
                                    className="absolute pointer-events-none z-20 flex items-center gap-1.5"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    {isLocked && (
                                        <div className="flex flex-col items-center gap-1 group pointer-events-auto">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-red-500/20 transition-all hover:scale-110 active:scale-95"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.6) 0%, rgba(220,38,38,0.6) 100%)',
                                                    backdropFilter: 'blur(8px)'
                                                }}
                                            >
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>

                                            {/* Lock Identity Card (Staff Level UX) - Hidden until hover */}
                                            <div className="absolute top-10 flex-col items-center gap-0.5 min-w-[100px] animate-fade-up hidden group-hover:flex">
                                                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl flex flex-col items-center z-50">
                                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">Locked by</p>
                                                    <p className="text-[11px] font-extrabold text-white truncate max-w-[120px]">{lockInfo.lockedBy}</p>
                                                    {lockInfo.expiresAt && (
                                                        <div className="flex items-center gap-1 mt-1 opacity-80">
                                                            <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                                                            <p className="text-[9px] font-semibold text-red-200 font-mono">
                                                                Expires: {new Date(lockInfo.expiresAt).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {commentCount > 0 && (
                                        <div
                                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-xl border border-white/10"
                                            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(37,99,235,0.95) 100%)', backdropFilter: 'blur(12px)' }}
                                            title={`${commentCount} comment${commentCount > 1 ? 's' : ''}`}
                                        >
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="text-xs font-black text-white">{commentCount}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Transparent overlay for mouse move events on the whole container */}
                        <div
                            className="absolute inset-0 z-10 opacity-0"
                            onClick={(e) => handleCanvasClick(e as unknown as React.MouseEvent<HTMLCanvasElement>)}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseLeave={handleCanvasMouseLeave}
                            onTouchMove={handleCanvasMouseMove as any}
                            onTouchEnd={handleCanvasMouseLeave}
                        />
                    </div>
                )
            }

            {/* ── 3D Exterior view ── */}
            {
                viewMode === '3d' && (
                    <div
                        className="relative w-full max-w-6xl rounded-[32px] overflow-hidden select-none"
                        style={{
                            aspectRatio: '4/3',
                            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
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
                            className="w-full h-full object-cover pointer-events-none"
                            style={{ transition: 'opacity 0.2s ease' }}
                            draggable={false}
                        />

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
                )
            }

            {/* ── Virtual Walkthrough view ── */}
            {
                viewMode === 'virtual' && (
                    <div
                        className="relative w-full max-w-6xl rounded-[32px] overflow-hidden"
                        style={{
                            aspectRatio: '4/3',
                            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
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

                        <div className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2">
                            <span
                                className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: vwScreen === 0 ? '#60a5fa' : 'var(--text-primary)' }}
                            >
                                {vwScreen === 0 ? '3D Dollhouse' : 'Virtual Tour'}
                            </span>
                        </div>

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
                )
            }

            <div className="mt-4 flex items-center justify-center w-full">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {(viewMode === 'photo' || viewMode === 'schematic' || viewMode === 'wireframe') && 'Click regions to select and customize • Hold Shift to multi-select'}
                    {viewMode === '3d' && '3D Preview — Exploratory photorealistic render'}
                    {viewMode === 'virtual' && 'Virtual Tour Beta — Curated camera scenes'}
                </span>
            </div>
        </div>
    );
}
