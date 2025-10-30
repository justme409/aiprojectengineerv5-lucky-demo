import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen } from 'lucide-react'

interface PageProps {
  params: Promise<{ projectId: string }>
}

async function getProjectMetrics(projectId: string) {
  const project = await getProjectById(projectId)
  if (!project) return null

  const assets = await getAssets({ project_id: projectId })

  const lots = assets.filter(asset => asset.type === 'lot')
  const totalLots = lots.length
  const completedLots = lots.filter(lot => lot.status === 'completed').length
  const activeLots = lots.filter(lot => lot.status === 'active').length
  const pendingApprovals = assets.filter(asset => asset.approval_state === 'pending_review').length

  const recentActivity = assets
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      created_at: asset.created_at
    }))

  return {
    project,
    metrics: {
      totalLots,
      completedLots,
      activeLots,
      pendingApprovals,
      recentActivity
    }
  }
}

export default async function ClientDashboardPage({ params }: PageProps) {
  const { projectId } = await params
  const data = await getProjectMetrics(projectId)
  if (!data) notFound()

  const { project, metrics } = data

  const navLinks = [
    {
      title: 'Management Plans',
      description: 'Quality, environmental, safety and traffic plans',
      href: `/portal/projects/${projectId}/management-plans`
    },
    {
      title: 'Documents',
      description: 'Approved client-facing documentation',
      href: `/portal/projects/${projectId}/documents`
    },
    {
      title: 'ITP Templates',
      description: 'Inspection & test plans register',
      href: `/portal/projects/${projectId}/itp-templates`
    },
    {
      title: 'Work Breakdown Structure',
      description: 'View project hierarchy and packages',
      href: `/portal/projects/${projectId}/wbs`
    },
    {
      title: 'Work Lots',
      description: 'Track construction lot progress',
      href: `/portal/projects/${projectId}/lots`
    },
    {
      title: 'Pending Approvals',
      description: 'Outstanding reviews & approvals',
      href: `/portal/projects/${projectId}/pending-approvals`
    },
    {
      title: 'Non-Conformance Reports',
      description: 'Monitor NCR status and actions',
      href: `/portal/projects/${projectId}/ncrs`
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{project.name || 'Project Dashboard'}</h1>
          <p className="text-gray-600">Client Portal Overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Lots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics.totalLots}</p>
              <p className="text-xs text-muted-foreground">Active: {metrics.activeLots}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Lots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics.completedLots}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics.pendingApprovals}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates across lots, documents and approvals.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.map((activity) => (
                    <li key={activity.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.name}</span>
                      <span className="text-xs text-muted-foreground">({activity.type})</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-600">No recent activity</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Links</CardTitle>
              <CardDescription>Jump directly to key information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/portal/projects/${projectId}/documents`}>View Documents</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/portal/projects/${projectId}/pending-approvals`}>Check Approvals</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/portal/projects/${projectId}/management-plans`}>Management Plans</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Navigate Project</h2>
            <p className="text-sm text-muted-foreground">Explore all available modules for this project.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navLinks.map(({ title, description, href }) => (
              <Card key={href} className="hover:shadow transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-center" asChild>
                    <Link href={href}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

