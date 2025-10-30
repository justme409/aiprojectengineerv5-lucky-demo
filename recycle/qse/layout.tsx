"use client"

import { ReactNode, useState } from 'react'
import { QseSidebar } from '@/components/layout/QseSidebar'
import { AppHeader } from '@/components/layout/AppHeader'

export default function QseLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        <QseSidebar className="flex-shrink-0" onCollapseChange={setSidebarCollapsed} />
        <main className="flex-1 overflow-auto" style={{ width: sidebarCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 256px)' }}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
