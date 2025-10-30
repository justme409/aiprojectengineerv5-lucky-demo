'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LotCloseoutPack() {
  const params = useParams()
  const projectId = (params as any)?.projectId as string | undefined
  const lotId = (params as any)?.lotId as string | undefined

  const href = projectId && lotId
    ? `/projects/${projectId}/lots/${lotId}/closeout`
    : '/projects'

  return (
    <div className="p-4">
      <p className="mb-2">Open the Lot Closeout page:</p>
      <Link className="text-primary underline" href={href}>{href}</Link>
    </div>
  )
}

