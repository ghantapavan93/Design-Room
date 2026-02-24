import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Design Room',
    description: 'Collaborative exterior design in real-time. This turns design sessions into structured decisions that reduce rework, speed approvals, and create a data trail for what wins jobs.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <div id="toast-container" className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none" />
            </body>
        </html>
    )
}
