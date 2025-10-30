'use client'

import { useParams } from 'next/navigation'
import { ProjectInbox } from '@/components/features/email/ProjectInbox'

export default function ProjectInboxPage() {
	const params = useParams()
	const projectId = params.projectId as string
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">Project Inbox</h1>
			<ProjectInbox projectId={projectId} />
		</div>
	)
}


