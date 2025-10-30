'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface InspectionPoint {
  inspection_point_id: string
  code: string
  title: string
  point_type: string
  itp_item_ref: string
  jurisdiction_rule_ref: string
  notified_at: string
  released_at: string
  sla_due_at: string
  approval_state: string
}

interface HoldWitnessRegisterProps {
  projectId: string
}

export default function HoldWitnessRegister({ projectId }: HoldWitnessRegisterProps) {
  const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInspectionPoints = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness`)
      if (response.ok) {
        const data = await response.json()
        setInspectionPoints(data.inspection_points)
      }
    } catch (error) {
      console.error('Error fetching inspection points:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchInspectionPoints()
  }, [fetchInspectionPoints])

  const handleAction = async (action: 'notify' | 'release' | 'reject', inspectionPointId: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, inspectionPointId })
      })

      if (response.ok) {
        fetchInspectionPoints() // Refresh data
      }
    } catch (error) {
      console.error(`Error ${action}ing inspection point:`, error)
    }
  }

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPointTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hold':
        return 'bg-red-100 text-red-800'
      case 'witness':
        return 'bg-muted text-foreground'
      case 'surveillance':
        return 'bg-yellow-100 text-yellow-800'
      case 'record':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (slaDueAt: string) => {
    return new Date(slaDueAt) < new Date() && !slaDueAt
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hold & Witness Register</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Create Inspection Point
        </Button>
      </div>

      {inspectionPoints.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inspection points yet</h3>
          <p className="text-gray-500 mb-6">Create inspection points to track hold and witness requirements.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Create Inspection Point
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Inspection Points ({inspectionPoints.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA Due</TableHead>
                  <TableHead>Notified</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionPoints.map((point) => (
                  <TableRow key={point.inspection_point_id}>
                    <TableCell className="font-medium">{point.code}</TableCell>
                    <TableCell>{point.title}</TableCell>
                    <TableCell>
                      <Badge className={getPointTypeColor(point.point_type)}>
                        {point.point_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(point.approval_state)}>
                        {point.approval_state}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={isOverdue(point.sla_due_at) ? 'text-red-600 font-medium' : ''}>
                        {new Date(point.sla_due_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {point.notified_at ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {point.released_at ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!point.notified_at && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('notify', point.inspection_point_id)}
                          >
                            Notify
                          </Button>
                        )}
                        {!point.released_at && point.notified_at && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('release', point.inspection_point_id)}
                          >
                            Release
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction('reject', point.inspection_point_id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}