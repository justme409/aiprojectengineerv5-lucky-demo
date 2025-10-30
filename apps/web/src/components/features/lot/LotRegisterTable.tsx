'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Lot {
  lot_asset_id: string
  lot_name: string
  lot_number: string
  lot_status: string
  itp_document_asset_id: string
  inspection_points: Array<{
    inspection_point_id: string
    code: string
    title: string
    point_type: string
    sla_due_at: string
    released_at: string
    approval_state: string
  }>
  test_results: any[]
}

interface LotRegisterTableProps {
  projectId: string
  viewMode?: 'wbs' | 'lbs'
}

export default function LotRegisterTable({ projectId, viewMode = 'wbs' }: LotRegisterTableProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLots = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/lots?view=${viewMode}`)
      if (response.ok) {
        const data = await response.json()
        setLots(data.lots)
      }
    } catch (error) {
      console.error('Error fetching lots:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, viewMode])

  useEffect(() => {
    fetchLots()
  }, [fetchLots])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-muted text-foreground'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInspectionStatus = (points: any[]) => {
    const total = points.length
    const released = points.filter(p => p.released_at).length
    return `${released}/${total}`
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
        <h1 className="text-3xl font-bold text-gray-900">Lot Register ({viewMode.toUpperCase()} View)</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Create Lot
        </Button>
      </div>

      {lots.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lots yet</h3>
          <p className="text-gray-500 mb-6">Create work lots to organize your construction activities.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Create Lot
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Work Lots ({lots.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ITP</TableHead>
                  <TableHead>Inspection Points</TableHead>
                  <TableHead>Test Results</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((lot) => (
                  <TableRow key={lot.lot_asset_id}>
                    <TableCell className="font-medium">{lot.lot_number}</TableCell>
                    <TableCell>{lot.lot_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lot.lot_status)}>
                        {lot.lot_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lot.itp_document_asset_id ? (
                        <span className="text-green-600">✓ Linked</span>
                      ) : (
                        <span className="text-red-600">Not linked</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getInspectionStatus(lot.inspection_points)}
                    </TableCell>
                    <TableCell>
                      {lot.test_results?.length || 0} results
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
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
