"use client"

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/api/client';
import { LINK_QUERY } from '@/api/queries';

export default function LiveRoomGateway() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    React.useEffect(() => {
        async function resolveLink() {
            try {
                const res = await api.graphqlRequest<any>(LINK_QUERY, { token });
                const link = res.shareLink;

                if (link.mode === 'live') {
                    if (link.designSessionToken) {
                        sessionStorage.setItem('designSessionToken', link.designSessionToken);
                        sessionStorage.setItem('sessionRole', link.permission === 'suggester' ? 'homeowner' : 'contractor');
                        sessionStorage.setItem('sessionPermission', link.permission);
                    }
                    router.replace(`/design/${link.design.id}`);
                } else {
                    router.replace(`/design/view/${token}`);
                }
            } catch (err) {
                console.error("Failed to resolve link", err);
                alert("Invalid or expired link");
                router.replace('/');
            }
        }

        if (token) {
            resolveLink();
        }
    }, [token, router]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-neutral-50 text-neutral-500">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                <p>Joining Design Room...</p>
            </div>
        </div>
    );
}
