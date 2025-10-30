import { redirect } from 'next/navigation'

export default function ItpTemplatesAliasPage({ params }: { params: Promise<{ projectId: string }> }) {
  // Prefer the consolidated register route
  const p = params
  return (async () => {
    const { projectId } = await p
    redirect(`/projects/${projectId}/quality/itp-templates-register`)
  })() as any
}

