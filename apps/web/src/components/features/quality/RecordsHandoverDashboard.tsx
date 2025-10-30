'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'

interface RecordItem {
  asset_id: string
  name: string
  type: string
  subtype: string
  status: string
  approval_state: string
  records_identified: any[]
}

interface RecordsHandoverDashboardProps {
  projectId: string
}

export default function RecordsHandoverDashboard({ projectId }: RecordsHandoverDashboardProps) {
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [handoverProgress, setHandoverProgress] = useState(0)

  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/records`)
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records_handover)

        // Calculate handover progress
        const totalRecords = data.records_handover.length
        const deliveredRecords = data.records_handover.filter(
          (record: RecordItem) => record.status === 'delivered'
        ).length
        setHandoverProgress(totalRecords > 0 ? (deliveredRecords / totalRecords) * 100 : 0)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleMarkDelivered = async (recordId: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/quality/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, action: 'mark_delivered' })
      })

      if (response.ok) {
        fetchRecords() // Refresh data
      }
    } catch (error) {
      console.error('Error marking record as delivered:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecordCount = (records: any[]) => {
    if (!records) return 0
    if (Array.isArray(records)) return records.length
    return Object.keys(records).length
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
        <h1 className="text-3xl font-bold text-gray-900">Records Handover Dashboard</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Export RMP
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Handover Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={handoverProgress} className="w-full" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {handoverProgress.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Records delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {records.reduce((sum, record) => sum + getRecordCount(record.records_identified), 0)}
            </p>
            <p className="text-sm text-gray-600">Identified records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {records.filter(r => r.status !== 'delivered').length}
            </p>
            <p className="text-sm text-gray-600">Records remaining</p>
          </CardContent>
        </Card>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records identified yet</h3>
          <p className="text-gray-500 mb-6">Records management plans will show identified records here.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Records Status ({records.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document/Plan</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records Identified</TableHead>
                  <TableHead>Approval State</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.asset_id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell className="capitalize">
                      {record.type.replace('_', ' ')}
                      {record.subtype && ` (${record.subtype})`}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getRecordCount(record.records_identified)} records
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.approval_state)}>
                        {record.approval_state}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {record.status !== 'delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkDelivered(record.asset_id)}
                          >
                            Mark Delivered
                          </Button>
                        )}
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