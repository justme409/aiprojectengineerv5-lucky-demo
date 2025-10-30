'use client'

import { useParams } from 'next/navigation'
import ReportsDashboard from '@/components/features/reports/ReportsDashboard'

export default function ReportsPage() {
  const params = useParams()
  const projectId = params.projectId as string
	return <ReportsDashboard projectId={projectId} />
}
