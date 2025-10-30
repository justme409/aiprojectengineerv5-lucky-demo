import WorkLotRegister from '@/components/features/quality/WorkLotRegister'

export default async function LotsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <WorkLotRegister projectId={projectId} />
}

