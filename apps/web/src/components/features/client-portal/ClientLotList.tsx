'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface GraphLot {
  lotAssetId: string
  lotName: string
  lotNumber: string
  lotStatus: string
  inspectionPoints: Array<{
    approvalState: string
    releasedAt: string | null
  }>
  testResults: any[]
  createdAt?: string
}

interface LotSummary {
  id: string
  name: string
  lotNumber: string
  status: string
  approvalState: string
  createdAt: string
  inspectionPointsCount: number
  testResultsCount: number
}

interface ClientLotListProps {
  projectId: string
}

export default function ClientLotList({ projectId }: ClientLotListProps) {
  const [lots, setLots] = useState<LotSummary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLots = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/lots`)
      if (response.ok) {
        const data = await response.json()
        const graphLots: GraphLot[] = data.lots || []
        const mapped: LotSummary[] = graphLots.map((lot) => {
          const approvalState = lot.inspectionPoints.every((point) => point.approvalState === 'approved')
            ? 'approved'
            : lot.inspectionPoints.some((point) => point.approvalState === 'rejected')
            ? 'rejected'
            : 'pending_review'

          return {
            id: lot.lotAssetId,
            name: lot.lotName,
            lotNumber: lot.lotNumber,
            status: lot.lotStatus,
            approvalState,
            createdAt: lot.createdAt || new Date().toISOString(),
            inspectionPointsCount: lot.inspectionPoints.length,
            testResultsCount: lot.testResults?.length || 0,
          }
        })
        setLots(mapped)
      }
    } catch (error) {
      console.error('Error fetching lots:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchLots()
  }, [fetchLots])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-muted text-foreground"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>
      case 'on_hold':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />On Hold</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getApprovalBadge = (state: string) => {
    switch (state.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Lots</h1>
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Lots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lots.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lots.filter((l) => l.status === 'closed' || l.status === 'conformed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {lots.filter((l) => l.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lots.filter((l) => l.status === 'on_hold').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lot Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {lots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No lots available yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Inspections</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.lotNumber}</TableCell>
                    <TableCell>{lot.name}</TableCell>
                    <TableCell>{getStatusBadge(lot.status)}</TableCell>
                    <TableCell>{getApprovalBadge(lot.approvalState)}</TableCell>
                    <TableCell>{lot.inspectionPointsCount}</TableCell>
                    <TableCell>{lot.testResultsCount}</TableCell>
                    <TableCell>{new Date(lot.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Download Pack
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

