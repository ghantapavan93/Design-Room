"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/api/client';
import { DESIGNS_QUERY } from '@/api/queries';
import { AddPhotoModal } from '@/components/design/add_photo_modal';

export default function ProjectsDashboard() {
    const router = useRouter();
    const [designs, setDesigns] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.graphqlRequest<any>(DESIGNS_QUERY, {});
                if (res.designs) {
                    setDesigns(res.designs);
                }
            } catch (err) {
                console.error("Failed to fetch designs", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleCreate = () => {
        // Modal inherently handles the creation routing
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col" style={{ background: 'var(--bg-base)' }}>
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
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
            </nav>

            <main className="pt-28 px-8 max-w-[1400px] mx-auto w-full pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">Projects</h1>
                        <p className="text-neutral-500 font-medium">Manage your active design sessions and proposals.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="pill bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : designs.length === 0 ? (
                    <div className="text-center py-32 rounded-3xl border border-dashed border-neutral-300 bg-white shadow-sm">
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No projects yet</h3>
                        <p className="text-neutral-500 mb-6 max-w-sm mx-auto">Upload a house exterior photo to start your first interactive design session.</p>
                        <button onClick={() => setIsModalOpen(true)} className="pill bg-neutral-900 text-white font-bold hover:bg-black">
                            Upload Photo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {designs.map((design: any) => (
                            <div
                                key={design.id}
                                onClick={() => router.push(`/design/${design.id}`)}
                                className="group cursor-pointer rounded-2xl bg-white border border-neutral-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                                    {design.baseMediaUrl ? (
                                        design.baseMediaUrl.endsWith('.mp4') || design.baseMediaUrl.endsWith('.webm') ? (
                                            <video
                                                src={design.baseMediaUrl}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                muted loop playsInline
                                                onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
                                                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                            />
                                        ) : (
                                            <Image
                                                src={design.baseMediaUrl}
                                                alt={design.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <span className="pill bg-blue-500/90 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg">
                                            Open Room
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-extrabold text-lg text-neutral-900 truncate mb-1">{design.title}</h3>
                                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                                        Created {new Date(design.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between text-neutral-400 group-hover:text-blue-600 transition-colors">
                                        {design.maskReady === false ? (
                                            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Processing…</span>
                                        ) : (
                                            <span className="text-xs font-bold uppercase tracking-widest">In-Progress</span>
                                        )}
                                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AddPhotoModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onPhotoSelected={handleCreate}
            />
        </div>
    );
}
