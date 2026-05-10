import { NextResponse } from 'next/server';

/**
 * Keep-alive cron endpoint.
 * Pings the Render backend every 14 minutes to prevent free-tier cold starts.
 * Configured via vercel.json cron schedule.
 */
export async function GET() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://design-room-api.onrender.com';
    const start = Date.now();

    try {
        const res = await fetch(`${apiUrl}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: '{ __typename }'
            }),
        });

        const elapsed = Date.now() - start;
        const ok = res.ok;

        console.log(`[keep-alive] pinged ${apiUrl} — ${ok ? 'OK' : res.status} in ${elapsed}ms`);

        return NextResponse.json({
            status: ok ? 'alive' : 'error',
            apiUrl,
            responseTime: elapsed,
            httpStatus: res.status,
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        const elapsed = Date.now() - start;
        console.error(`[keep-alive] ping failed: ${err.message}`);

        return NextResponse.json({
            status: 'error',
            apiUrl,
            error: err.message,
            responseTime: elapsed,
            timestamp: new Date().toISOString()
        }, { status: 502 });
    }
}
