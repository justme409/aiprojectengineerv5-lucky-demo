import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Plus
} from 'lucide-react'

interface NCR {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  reportedBy: string
  reportedAt: string
  resolvedBy?: string
  resolvedAt?: string
  category: string
  location?: string
  correctiveAction?: string
}

type NcrsPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function NcrsPage({ params }: NcrsPageProps) {
  const { projectId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/ncrs`)
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    notFound()
  }

  // Simple auth check - user must be the project creator
  if (project.created_by_user_id !== session.user.id) {
    notFound()
  }

  // Fetch NCRs from assets
  const assets = await getAssets({ project_id: projectId, type: 'ncr' })
  const ncrs: NCR[] = assets.map(asset => ({
    id: asset.id,
    title: asset.name || (asset.content?.title || ''),
    description: asset.content?.description || '',
    severity: asset.content?.severity || 'medium',
    status: asset.status === 'active' ? 'open' : (asset.status as any) || 'open',
    reportedBy: asset.content?.reported_by || 'Unknown',
    reportedAt: asset.created_at,
    resolvedBy: asset.content?.resolved_by,
    resolvedAt: asset.content?.resolved_at,
    category: asset.content?.category || 'General',
    location: asset.content?.location,
    correctiveAction: asset.content?.corrective_action
  }))

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'destructive',
      critical: 'destructive'
    } as const

    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    }

    return (
      <Badge variant={variants[severity as keyof typeof variants]}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      investigating: 'outline',
      resolved: 'secondary',
      closed: 'default'
    } as const

    const labels = {
      open: 'Open',
      investigating: 'Investigating',
      resolved: 'Resolved',
      closed: 'Closed'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'investigating':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'open':
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <Link href={`/projects/${projectId}/overview`} className="text-sm text-muted-foreground hover:underline">
                ← Back to Project
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Non-Conformance Reports</h1>
              <p className="text-gray-600 mt-2">
                View and track non-conformance reports and corrective actions for {project.name}.
              </p>
            </div>
            <Button asChild>
              <Link href={`/projects/${projectId}/ncrs/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New NCR
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NCRs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ncrs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {ncrs.filter(ncr => ncr.status === 'open').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {ncrs.filter(ncr => ncr.status === 'resolved' || ncr.status === 'closed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {ncrs.filter(ncr => ncr.severity === 'high' || ncr.severity === 'critical').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NCRs Table */}
        <Card>
          <CardHeader>
            <CardTitle>NCR Reports</CardTitle>
            <CardDescription>
              {ncrs.length} reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ncrs.map((ncr) => (
                  <TableRow key={ncr.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ncr.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {ncr.description}
                        </div>
                        {ncr.location && (
                          <div className="text-xs text-muted-foreground">
                            Location: {ncr.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(ncr.severity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ncr.status)}
                        {getStatusBadge(ncr.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ncr.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(ncr.reportedAt)}
                        </div>
                        <div className="flex items-center mt-1">
                          <User className="mr-1 h-3 w-3" />
                          {ncr.reportedBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${projectId}/ncrs/${ncr.id}`}>
                          <Eye className="mr-2 h-3 w-3" />
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {ncrs.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No NCRs Found</h3>
                <p className="text-muted-foreground">
                  No non-conformance reports have been filed for this project yet.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/projects/${projectId}/ncrs/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First NCR
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
