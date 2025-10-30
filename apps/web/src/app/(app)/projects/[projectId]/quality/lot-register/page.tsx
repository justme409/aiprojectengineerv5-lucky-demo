import { LotRegisterTableWrapper } from '@/components/features/lot/LotRegisterTableWrapper'

type LotRegisterPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function LotRegisterPage({ params }: LotRegisterPageProps) {
  const { projectId } = await params
  return (
    <div className="container mx-auto p-4">
      <LotRegisterTableWrapper projectId={projectId} />
    </div>
  )
}

export const revalidate = 0


