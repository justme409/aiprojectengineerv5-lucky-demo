'use client'

import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const ApprovalsInbox = dynamic(() => import('@/components/features/approvals/ApprovalsInbox'), { ssr: false })

export default function Page() {
	const params = useParams()
	const projectId = params.projectId as string
	const { data: session, status } = useSession()
	const [userId, setUserId] = useState<string>('')

	useEffect(() => {
		if (session?.user) {
			setUserId((session.user as any).id)
		}
	}, [session])

	if (status === 'loading') {
		return <div>Loading...</div>
	}

	if (!session) {
		return <div>Please log in to view approvals</div>
	}

	return <ApprovalsInbox projectId={projectId} userId={userId} />
}


