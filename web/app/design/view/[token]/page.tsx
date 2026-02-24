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

    React.useEffect(() => {
        async function load() {
            try {
                const linkRes = await api.graphqlRequest<any>(LINK_QUERY, { token });
                const designId = linkRes.shareLink.design.id;

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
            } catch (e) {
                console.error(e);
                toast({ title: "Failed to load view link", variant: "destructive" });
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

    if (!design) {
        return <div className="h-screen w-full flex items-center justify-center p-4">Design not found.</div>;
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
                        baseImageUrl="/demo/exterior_base.jpg"
                        masksUrlPrefix="/demo"
                        selectedMaterials={matState}
                        presetsMap={presets}
                    />
                </div>
            </div>
        </EditorShell>
    );
}
