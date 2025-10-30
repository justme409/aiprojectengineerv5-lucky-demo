import { Suspense } from 'react'
import ClientDocumentList from '@/components/features/client-portal/ClientDocumentList'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function ClientDocumentsPage({ params }: Props) {
  const { projectId } = await params
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading documents...</div>}>
        <ClientDocumentList projectId={projectId} />
      </Suspense>
    </div>
  )
}
