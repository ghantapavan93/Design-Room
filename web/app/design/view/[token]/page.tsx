"use client"

import * as React from 'react';
import { useParams } from 'next/navigation';
import { EditorShell } from '@/components/design/editor_shell';
import { PreviewCanvas } from '@/components/design/preview_canvas';
import { Button } from '@/components/ui/button';
import { api } from '@/api/client';
import { LINK_QUERY, DESIGN_QUERY, MATERIALS_QUERY } from '@/api/queries';
import { Design, MaterialPreset } from '@/lib/types';
import { DesignRegion } from '@/lib/regions';
import { toast } from '@/components/ui/toast';

export default function ViewOnlyPage() {
    const params = useParams();
    const token = params.token as string;

    const [design, setDesign] = React.useState<Design | null>(null);
    const [presets, setPresets] = React.useState<Record<string, MaterialPreset>>({});
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function load() {
            try {
                const linkRes = await api.graphqlRequest<any>(LINK_QUERY, { token });
                const link = linkRes.shareLink;

                // Only allow view-mode links on this page
                if (link.mode !== 'view') {
                    toast({ title: "This link is not a view-only link. Redirecting...", variant: "destructive" });
                    window.location.href = `/design/live/${token}`;
                    return;
                }

                const designId = link.design.id;

                const [designRes, matRes] = await Promise.all([
                    api.graphqlRequest<any>(DESIGN_QUERY, { id: designId }),
                    api.graphqlRequest<any>(MATERIALS_QUERY)
                ]);

                const map: Record<string, MaterialPreset> = {};
                matRes.materials.forEach((m: MaterialPreset) => {
                    map[m.id] = m;
                });

                setPresets(map);
                setDesign(designRes.design);
            } catch (e: any) {
                const msg = e?.message || '';
                if (msg.includes('revoked')) {
                    setError('This share link has been revoked by the project owner.');
                } else if (msg.includes('expired')) {
                    setError('This share link has expired.');
                } else {
                    setError('Failed to load design.');
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [token]);

    const handleDownload = () => {
        if (!design) return;
        const currentState = design.state.stateJson;
        const summary = Object.entries(currentState).map(([region, matId]) => {
            const mat = presets[matId];
            return { region, material: mat ? mat.name : 'Unknown', brand: mat ? mat.brand : '' };
        });

        const blob = new Blob([JSON.stringify({ title: design.title, summary }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-summary-${design.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center p-4">Loading preview...</div>;
    }

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center gap-5 max-w-md text-center px-6">
                    <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 mb-2">Link Unavailable</h2>
                        <p className="text-sm text-neutral-500">{error}</p>
                    </div>
                    <a href="/" className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold">Go Home</a>
                </div>
            </div>
        );
    }

    if (!design) {
        return <div className="h-screen w-full flex items-center justify-center p-4">Design not found.</div>;
    }

    if (design.maskReady === false) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-neutral-900">
                <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
                    <div className="w-20 h-20 border-4 border-neutral-700 border-t-white rounded-full animate-spin shadow-lg" />
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight mb-2">Processing Your Design...</h2>
                        <p className="text-sm font-medium text-neutral-400">Our engines are parsing the property boundaries and generating high-fidelity structural masks.</p>
                    </div>
                </div>
            </div>
        );
    }

    const matState = design.state.stateJson as Record<DesignRegion, string>;

    return (
        <EditorShell>
            <div className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-20 relative">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">{design.title}</h1>
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Summary
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 border-r border-neutral-200 bg-white p-6 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-6">Final Materials</h2>
                    <div className="space-y-4">
                        {Object.entries(matState).map(([region, matId]) => {
                            const mat = presets[matId];
                            return (
                                <div key={region} className="border border-neutral-100 rounded-lg p-3 bg-neutral-50 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-neutral-200" style={{ backgroundColor: mat?.swatchHex || '#ccc' }} />
                                    <div>
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-0.5">{region}</h3>
                                        <p className="text-sm font-semibold text-neutral-900">{mat ? mat.name : 'Unselected'}</p>
                                        <p className="text-xs text-neutral-500">{mat ? mat.brand : ''}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 h-full relative">
                    <PreviewCanvas
                        baseImageUrl={design.baseMediaUrl || "/demo/coastal/base.jpg"}
                        masksUrlPrefix={design.masksUrlPrefix || "/demo/coastal"}
                        selectedMaterials={matState}
                        presetsMap={presets}
                        selectedRegions={[]}
                    />
                </div>
            </div>
        </EditorShell>
    );
}
