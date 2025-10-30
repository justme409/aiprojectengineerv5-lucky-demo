'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, XCircle, User, Calendar } from 'lucide-react'

interface Approval {
  id: string
  user_id: string
  user_name: string
  role: string
  decision: 'approved' | 'rejected' | 'pending'
  comments?: string
  approved_at: string
}

interface AssetApprovalPanelProps {
  assetId: string
  projectId: string
  assetType: string
  status: string
}

export default function AssetApprovalPanel({
  assetId,
  projectId,
  assetType,
  status
}: AssetApprovalPanelProps) {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true)
        // Fetch approval edges for this asset
        const response = await fetch(`/api/v1/assets/${assetId}/approvals`)
        if (response.ok) {
          const data = await response.json()
          setApprovals(data.approvals || [])
        }
      } catch (error) {
        console.error('Error fetching approvals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [assetId])

  const getApprovalIcon = (decision: string) => {
    switch (decision) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getApprovalBadgeVariant = (decision: string) => {
    switch (decision) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Status</CardTitle>
        <CardDescription>
          Current approval workflow for this {assetType}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status:</span>
          <Badge variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}>
            {status || 'draft'}
          </Badge>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-3">Approval History</h4>
          {approvals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approvals recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => (
                <div key={approval.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getApprovalIcon(approval.decision)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{approval.user_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {approval.role}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getApprovalBadgeVariant(approval.decision)} className="text-xs">
                        {approval.decision}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(approval.approved_at)}
                      </div>
                    </div>
                    {approval.comments && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {approval.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder for approval actions - would need proper implementation */}
        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" disabled>
            Request Approval
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
