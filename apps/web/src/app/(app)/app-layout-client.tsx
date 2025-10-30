"use client"

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { KnowledgeAssistantSidebar } from '@/components/knowledge-assistant/KnowledgeAssistantSidebar'

export default function AppLayoutClient({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="flex relative" style={{ height: 'calc(100vh - 56px)' }}>
        <Sidebar className="flex-shrink-0" onCollapseChange={setSidebarCollapsed} />
        <main className="flex-1 overflow-auto" style={{ width: sidebarCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 256px)' }}>
          <div className="p-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
        <KnowledgeAssistantSidebar />
      </div>
    </div>
  )
}

