import { Suspense } from 'react'
import ClientProjectDetails from '@/components/features/client-portal/ClientProjectDetails'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function ClientProjectDetailsPage({ params }: Props) {
  const { projectId } = await params
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading project details...</div>}>
        <ClientProjectDetails projectId={projectId} />
      </Suspense>
    </div>
  )
}
