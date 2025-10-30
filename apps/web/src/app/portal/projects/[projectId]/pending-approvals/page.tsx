import ApprovalsInbox from '@/components/features/approvals/ApprovalsInbox'
import { auth } from '@/lib/auth'

export default async function PendingApprovalsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth()
  const userId = (session?.user as any)?.id || ''
  const { projectId } = await params
  return <ApprovalsInbox projectId={projectId} userId={userId} />
}
