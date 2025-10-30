'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const ApprovalsDesigner = dynamic(() => import('@/components/features/approvals/ApprovalsDesigner'), { ssr: false })

export default function Page() {
	const params = useParams()
	const projectId = params.projectId as string
	return <ApprovalsDesigner projectId={projectId} />
}


