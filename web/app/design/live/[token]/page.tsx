"use client"

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/api/client';
import { LINK_QUERY } from '@/api/queries';

export default function LiveRoomGateway() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function resolveLink() {
            try {
                const res = await api.graphqlRequest<any>(LINK_QUERY, { token });
                const link = res.shareLink;

                if (link.mode === 'live') {
                    sessionStorage.setItem(`shareToken_${link.design.id}`, token);
                    sessionStorage.removeItem(`designSessionToken_${link.design.id}`); // ensure fresh join
                    
                    // scrub legacy keys to ensure clean routing
                    sessionStorage.removeItem('shareToken');
                    sessionStorage.removeItem('designSessionToken');
                    
                    router.replace(`/design/${link.design.id}`);
                } else {
                    router.replace(`/design/view/${token}`);
                }
            } catch (err: any) {
                const msg = err?.message || '';
                if (msg.includes('revoked')) {
                    setError('This share link has been revoked by the project owner.');
                } else if (msg.includes('expired')) {
                    setError('This share link has expired.');
                } else {
                    setError('Invalid or expired link.');
                }
            }
        }

        if (token) {
            resolveLink();
        }
    }, [token, router]);

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

    return (
        <div className="h-screen w-full flex items-center justify-center bg-neutral-50 text-neutral-500">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                <p>Joining Design Room...</p>
            </div>
        </div>
    );
}
