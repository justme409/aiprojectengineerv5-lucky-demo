import RecordsHandoverDashboard from '@/components/features/quality/RecordsHandoverDashboard'

export default async function RecordsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <RecordsHandoverDashboard projectId={projectId} />
}

