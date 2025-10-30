import ClientItpTemplateList from '@/components/features/client-portal/ClientItpTemplateList'

export default async function ItpTemplatesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <ClientItpTemplateList projectId={projectId} />
}
