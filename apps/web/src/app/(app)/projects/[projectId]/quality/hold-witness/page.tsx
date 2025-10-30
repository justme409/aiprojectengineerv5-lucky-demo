import HoldWitnessRegister from '@/components/features/quality/HoldWitnessRegister'

export default async function HoldWitnessPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <HoldWitnessRegister projectId={projectId} />
}

