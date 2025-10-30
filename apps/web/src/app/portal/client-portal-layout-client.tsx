"use client"

import { ReactNode } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

interface ClientPortalLayoutProps {
  children: ReactNode
}

export default function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumbs />
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-muted-foreground">
            Access your project documents and approvals
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
