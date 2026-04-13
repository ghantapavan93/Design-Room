import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { api } from '@/api/client';
import { CREATE_DESIGN_MUTATION } from '@/api/queries';

interface AddPhotoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPhotoSelected: (file: File) => void;
}

export function AddPhotoModal({ open, onOpenChange, onPhotoSelected }: AddPhotoModalProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                // Upload file
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('Upload failed');

                const { url } = await uploadRes.json();

                // Create design
                const title = file.name.split('.')[0] || 'New Project';
                const creatorName = sessionStorage.getItem('sessionRole') === 'homeowner' ? 'Sam Homeowner' : 'Alex Contractor';

                // Ensure participant identity is established for the creator
                let pid = localStorage.getItem('designParticipantId');
                if (!pid) {
                    pid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    localStorage.setItem('designParticipantId', pid);
                }

                const designRes = await api.graphqlRequest<any>(CREATE_DESIGN_MUTATION, {
                    title,
                    baseMediaUrl: url,
                    creatorName: creatorName || 'Alex Contractor',
                    participantId: pid
                });

                if (designRes.createDesign?.success) {
                    sessionStorage.setItem('designSessionToken', designRes.createDesign.designSessionToken);
                    sessionStorage.setItem('sessionRole', 'contractor');
                    sessionStorage.setItem('sessionPermission', 'editor');

                    // Route user handles it
                    onPhotoSelected(file); // This will trigger routing in page.tsx if needed
                    window.location.href = `/design/${designRes.createDesign.design.id}`;
                } else {
                    console.error("Failed to create design", designRes.createDesign?.errors);
                }
            } catch (err) {
                console.error("Upload error", err);
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <div className="flex flex-col items-center justify-center pt-4 pb-2 px-2 text-center relative">
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-5 shadow-inner border border-blue-100">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>Start a new project</h2>
                <p className="text-sm px-6 mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Upload a high-quality photo of your space. For the best AI results, avoid people, pets, or large vehicles in the frame.
                </p>

                <div
                    className="w-full relative group rounded-2xl p-10 text-center transition-all cursor-pointer overflow-hidden backdrop-blur-3xl"
                    style={{ background: 'var(--bg-overlay)', border: '2px dashed #93c5fd' }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">
                            {isUploading ? (
                                <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            )}
                        </div>
                        <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                            {isUploading ? "Processing..." : "Click to browse or drag file here"}
                        </p>
                        <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>Supports JPG, PNG, MP4 up to 15MB</p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, video/mp4"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Visual Guidance */}
                <div className="mt-8 flex justify-center gap-8 w-full border-t border-neutral-100 pt-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Good Light</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Clear Angle</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">Obstructions</span>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
