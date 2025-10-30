import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import DocumentUpload from '@/components/features/document/DocumentUpload'
import DocumentRegister from '@/components/features/document/DocumentRegister'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectDocumentsPage({ params }: PageProps) {
	const { projectId } = await params
	const project = await getProjectById(projectId)
	if (!project) notFound()

	return (
		<main className="p-6">
			<DocumentRegister projectId={projectId} uploadButton={<DocumentUpload projectId={projectId} />} />
		</main>
	)
}
