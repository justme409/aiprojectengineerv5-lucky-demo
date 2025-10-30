import ClientLotList from '@/components/features/client-portal/ClientLotList'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function LotsPage({ params }: Props) {
  const { projectId } = await params
  return <ClientLotList projectId={projectId} />
}
