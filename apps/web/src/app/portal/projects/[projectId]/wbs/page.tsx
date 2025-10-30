import WbsView from '@/components/features/wbs/WbsView'

export default async function WbsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <WbsView projectId={projectId} />
}
