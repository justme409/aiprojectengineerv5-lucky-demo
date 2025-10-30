import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { getNcrById } from '@/lib/actions/ncr-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { ArrowLeftIcon, EditIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { NcrDeleteButton } from '@/components/features/ncr/NcrDeleteButton'
import AssetApprovalPanel from '@/components/features/approvals/AssetApprovalPanel'

// Helper function to format dates
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// Placeholder for badge variants, sync with other NCR components if needed
const getSeverityBadgeVariant = (severity?: string | null) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'destructive'
    case 'high': return 'destructive'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'outline'
  }
}

const getStatusBadgeVariant = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case 'open': return 'destructive'
    case 'in_progress': return 'secondary'
    case 'pending_approval': return 'default'
    case 'approved':
    case 'closed': return 'default'
    case 'rejected': return 'destructive'
    default: return 'outline'
  }
}

type NcrDetailPageProps = {
  params: Promise<{
    projectId: string
    ncrId: string
  }>
}

export default async function NcrDetailPage({ params }: NcrDetailPageProps) {
  const { projectId, ncrId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/projects/${projectId}/ncrs/${ncrId}`)
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    notFound()
  }

  // Simple auth check - user must be the project creator
  // TODO: Extend to check project membership if applicable
  if (project.created_by_user_id !== session.user.id) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>You do not have permission to view this NCR.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const ncrResult = await getNcrById(projectId, ncrId)

  if (!ncrResult.success || !ncrResult.data) {
    if (ncrResult.error === 'Not Found') {
      notFound()
    }
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Fetching NCR</AlertTitle>
          <AlertDescription>{ncrResult.message || "An unknown error occurred while fetching NCR details."}</AlertDescription>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/ncrs`}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to NCR List
              </Link>
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  const ncrAsset = ncrResult.data
  const ncr = {
    id: ncrAsset.id,
    project_id: ncrAsset.project_id,
    ncr_number: ncrAsset.document_number ?? null,
    title: ncrAsset.name ?? (ncrAsset.content?.title ?? ''),
    description: ncrAsset.content?.description ?? null,
    status: ncrAsset.status ?? null,
    severity: ncrAsset.content?.severity ?? null,
    created_at: ncrAsset.created_at ?? null,
    updated_at: ncrAsset.updated_at ?? null,
    due_date: ncrAsset.content?.due_date ?? null,
    lot_id: ncrAsset.content?.lot_id ?? null,
    corrective_action: ncrAsset.content?.corrective_action ?? null,
    preventive_action: ncrAsset.content?.preventive_action ?? null,
    root_cause: ncrAsset.content?.root_cause ?? null,
    created_by: ncrAsset.created_by,
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/projects/${projectId}/ncrs`} className="text-sm text-muted-foreground hover:underline flex items-center">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to NCRs for {project.name}
          </Link>
          <h1 className="text-3xl font-bold mt-1">NCR: {ncr.ncr_number || ncr.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/ncrs/${ncrId}/edit`}>
              <EditIcon className="mr-2 h-4 w-4" /> Edit NCR
            </Link>
          </Button>
          <NcrDeleteButton
            ncrId={ncr.id}
            projectId={ncr.project_id}
            ncrTitle={ncr.title}
            ncrNumber={ncr.ncr_number || ''}
            buttonVariant="destructive"
            onDeleteRedirect={`/projects/${projectId}/ncrs`}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ncr.title}</CardTitle>
          <div className="flex items-center space-x-2 pt-1">
            <Badge variant={getStatusBadgeVariant(ncr.status)}>{ncr.status || 'N/A'}</Badge>
            <Badge variant={getSeverityBadgeVariant(ncr.severity)}>{ncr.severity || 'N/A'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><strong>Project:</strong> {project.name}</p>
              <p><strong>NCR Number:</strong> {ncr.ncr_number || 'N/A'}</p>
              <p><strong>Status:</strong> {ncr.status || 'N/A'}</p>
              <p><strong>Severity:</strong> {ncr.severity || 'N/A'}</p>
              <p><strong>Date Raised:</strong> {formatDate(ncr.created_at)}</p>
              <p><strong>Due Date:</strong> {formatDate(ncr.due_date)}</p>
              <p><strong>Lot ID:</strong> {ncr.lot_id || 'N/A'}</p>
              <p><strong>Raised By (User ID):</strong> {ncr.created_by || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ncr.description || 'No description provided.'}
            </p>
          </div>

          {/* Placeholder for future sections like Corrective Action, Preventive Action, Root Cause, Attachments, Approvals */}
          {(ncr.corrective_action || ncr.preventive_action || ncr.root_cause) && <Separator />}

          {ncr.corrective_action && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Corrective Action</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ncr.corrective_action}</p>
            </div>
          )}
          {ncr.preventive_action && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Preventive Action</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ncr.preventive_action}</p>
            </div>
          )}
          {ncr.root_cause && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Root Cause Analysis</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ncr.root_cause}</p>
            </div>
          )}

        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Last updated: {formatDate(ncr.updated_at)}
        </CardFooter>
      </Card>

      <AssetApprovalPanel
        assetId={ncr.id}
        projectId={projectId}
        assetType="ncr"
        status={ncr.status || 'draft'}
      />
    </div>
  )
}

export const revalidate = 0
