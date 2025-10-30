import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { getInspectionRequestById } from '@/lib/actions/inspection-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { ArrowLeftIcon, EditIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

// Helper function to format dates
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// Placeholder for badge variants
const getStatusBadgeVariant = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'destructive'
    case 'in_progress': return 'secondary'
    case 'pending_review': return 'default'
    case 'approved':
    case 'completed': return 'default'
    case 'rejected': return 'destructive'
    default: return 'outline'
  }
}

const getSeverityBadgeVariant = (severity?: string | null) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'destructive'
    case 'high': return 'destructive'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'outline'
  }
}

type InspectionRequestPageProps = {
  params: Promise<{
    projectId: string
    irId: string
  }>
}

export default async function InspectionRequestPage({ params }: InspectionRequestPageProps) {
  const { projectId, irId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/inspections/${irId}`)
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    notFound()
  }

  // Simple auth check - user must be the project creator
  if (project.created_by_user_id !== session.user.id) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>You do not have permission to view this inspection request.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const irResult = await getInspectionRequestById(projectId, irId)

  if (!irResult.success || !irResult.data) {
    if (irResult.error === 'Not Found') {
      notFound()
    }
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Fetching Inspection Request</AlertTitle>
          <AlertDescription>{irResult.message || "An unknown error occurred while fetching inspection request details."}</AlertDescription>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/inspections`}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Inspection Requests
              </Link>
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  const irAsset = irResult.data
  const inspectionRequest = {
    id: irAsset.id,
    project_id: irAsset.project_id,
    title: irAsset.name ?? (irAsset.content?.title ?? ''),
    description: irAsset.content?.description ?? null,
    status: irAsset.status ?? null,
    severity: irAsset.content?.severity ?? null,
    created_at: irAsset.created_at ?? null,
    updated_at: irAsset.updated_at ?? null,
    due_date: irAsset.content?.due_date ?? null,
    scheduled_at: irAsset.content?.scheduled_at ?? null,
    requested_for: irAsset.content?.requested_for ?? null,
    checkpoint_id: irAsset.content?.checkpoint_id ?? null,
    lot_asset_id: irAsset.content?.lot_asset_id ?? null,
    wbs_node_asset_id: irAsset.content?.wbs_node_asset_id ?? null,
    lbs_node_asset_id: irAsset.content?.lbs_node_asset_id ?? null,
    sla_hours: irAsset.content?.sla_hours ?? null,
    acceptance_notes: irAsset.content?.acceptance_notes ?? null,
    created_by: irAsset.created_by,
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
      case 'pending_review':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'open':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/projects/${projectId}/inspections`} className="text-sm text-muted-foreground hover:underline flex items-center">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Inspection Requests for {project.name}
          </Link>
          <h1 className="text-3xl font-bold mt-1">IR: {inspectionRequest.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/inspections/${irId}/edit`}>
              <EditIcon className="mr-2 h-4 w-4" /> Edit IR
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{inspectionRequest.title}</CardTitle>
          <div className="flex items-center space-x-2 pt-1">
            <div className="flex items-center space-x-2">
              {getStatusIcon(inspectionRequest.status || '')}
              <Badge variant={getStatusBadgeVariant(inspectionRequest.status)}>{inspectionRequest.status || 'N/A'}</Badge>
            </div>
            {inspectionRequest.severity && (
              <Badge variant={getSeverityBadgeVariant(inspectionRequest.severity)}>{inspectionRequest.severity}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><strong>Project:</strong> {project.name}</p>
              <p><strong>Status:</strong> {inspectionRequest.status || 'N/A'}</p>
              <p><strong>Severity:</strong> {inspectionRequest.severity || 'N/A'}</p>
              <p><strong>Checkpoint ID:</strong> {inspectionRequest.checkpoint_id || 'N/A'}</p>
              <p><strong>Lot ID:</strong> {inspectionRequest.lot_asset_id || 'N/A'}</p>
              <p><strong>WBS Node:</strong> {inspectionRequest.wbs_node_asset_id || 'N/A'}</p>
              <p><strong>LBS Node:</strong> {inspectionRequest.lbs_node_asset_id || 'N/A'}</p>
              <p><strong>SLA Hours:</strong> {inspectionRequest.sla_hours || 'N/A'}</p>
              <p><strong>Date Created:</strong> {formatDate(inspectionRequest.created_at)}</p>
              <p><strong>Due Date:</strong> {formatDate(inspectionRequest.due_date)}</p>
              <p><strong>Scheduled For:</strong> {formatDate(inspectionRequest.scheduled_at)}</p>
              <p><strong>Requested For:</strong> {formatDate(inspectionRequest.requested_for)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {inspectionRequest.description || 'No description provided.'}
            </p>
          </div>

          {inspectionRequest.acceptance_notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">Acceptance Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {inspectionRequest.acceptance_notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Last updated: {formatDate(inspectionRequest.updated_at)}
        </CardFooter>
      </Card>
    </div>
  )
}

export const revalidate = 0
