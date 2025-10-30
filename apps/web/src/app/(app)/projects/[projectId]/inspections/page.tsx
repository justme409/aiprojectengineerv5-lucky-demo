import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import InspectionRegister from '@/components/features/qa/InspectionRegister'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function InspectionsPage({ params }: PageProps) {
	const { projectId } = await params
	const project = await getProjectById(projectId)
	if (!project) notFound()

	return (
		<main className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{project.name} - Inspection Register</h1>
				<p className="text-gray-600">Manage inspection requests and schedule inspections</p>
			</div>

			<InspectionRegister projectId={projectId} />
		</main>
	)
}
