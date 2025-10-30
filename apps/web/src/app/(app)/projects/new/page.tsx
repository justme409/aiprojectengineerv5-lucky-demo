import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewProjectUploadPage from '@/components/features/project/NewProjectUploadPage'

export default async function NewProjectPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/projects/new')
  }

  return <NewProjectUploadPage userName={session.user?.name ?? session.user?.email ?? null} />
}
