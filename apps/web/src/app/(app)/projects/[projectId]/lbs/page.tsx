'use client'

import { useParams } from 'next/navigation'
import LotRegisterTable from '@/components/features/lot/LotRegisterTable'

export default function LbsPage() {
	const params = useParams()
	const projectId = params.projectId as string

	return <LotRegisterTable projectId={projectId} />
}
