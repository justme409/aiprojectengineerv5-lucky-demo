import { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface SubcontractorLayoutProps {
    children: ReactNode;
}

export default function SubcontractorLayout({ children }: SubcontractorLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Breadcrumbs />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Subcontractor Portal</h1>
                    <p className="text-muted-foreground">
                        Manage your assigned work packages and inspections
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
