"use client"

import { useParams } from 'next/navigation'
import PrimaryTestingView from '@/components/features/quality/nsw/PrimaryTestingView'

export default function PrimaryTestingPage() {
	const params = useParams()
	const projectId = params.projectId as string
	return <PrimaryTestingView projectId={projectId} />
}
