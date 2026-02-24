"use client"

import * as React from "react"

const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (v: string) => void }>({ activeTab: '', setActiveTab: () => { } })

export function Tabs({ defaultValue, children, className = "" }: { defaultValue: string; children: React.ReactNode; className?: string }) {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={`flex flex-col w-full ${className}`}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500 ${className}`}>
            {children}
        </div>
    )
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
    const { activeTab, setActiveTab } = React.useContext(TabsContext)
    const isActive = activeTab === value

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white text-neutral-950 shadow-sm' : 'hover:bg-neutral-50 hover:text-neutral-900'}`}
            type="button"
            role="tab"
            aria-selected={isActive}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
    const { activeTab } = React.useContext(TabsContext)
    if (value !== activeTab) return null

    return (
        <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" role="tabpanel">
            {children}
        </div>
    )
}
