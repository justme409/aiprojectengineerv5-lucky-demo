import ItpRegister from '@/components/features/quality/ItpRegister'

export default async function ItpRegisterPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <ItpRegister projectId={projectId} />
}

