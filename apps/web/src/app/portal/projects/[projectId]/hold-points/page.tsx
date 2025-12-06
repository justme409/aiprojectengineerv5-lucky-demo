import { notFound } from 'next/navigation';
import HoldPointsPageClient from './HoldPointsPageClient';

interface PageProps {
    params: Promise<{ projectId: string }>;
}

export default async function HoldPointsPage({ params }: PageProps) {
    const { projectId } = await params;

    // Try to get project info, but don't fail if it doesn't exist
    let projectName = 'Project';
    try {
        // Dynamic import to avoid issues if getProjectById doesn't exist
        const { getProjectById } = await import('@/lib/actions/project-actions');
        const project = await getProjectById(projectId);
        if (project?.name) {
            projectName = project.name;
        }
    } catch (error) {
        // Project lookup failed, continue with default name
        console.log('Project lookup failed for hold points page:', error);
    }

    return (
        <HoldPointsPageClient
            projectId={projectId}
            projectName={projectName}
        />
    );
}
