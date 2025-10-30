import { notFound } from 'next/navigation'
import { getAssets } from '@/lib/actions/asset-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
	const { projectId } = await params

	const assets = await getAssets({
		project_id: projectId,
		type: 'project',
		limit: 1
	})

	const projectAsset = assets.find(asset => asset.type === 'project')

	if (!projectAsset?.content?.html) {
		notFound()
	}

	return (
		<div className="space-y-8">
			{/* Header with back button */}
			<div className="flex items-center gap-4">
				<Link href={`/projects/${projectId}`}>
					<ArrowLeft className="h-6 w-6" />
				</Link>
				<h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
			</div>

			{/* Project Details Content */}
			<Card>
				<CardHeader>
					<CardTitle>{projectAsset.name}</CardTitle>
					<CardDescription>Detailed project information and specifications</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						className="prose max-w-none"
						dangerouslySetInnerHTML={{ __html: projectAsset.content.html }}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
