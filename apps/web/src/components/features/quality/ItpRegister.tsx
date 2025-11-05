'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ITPTemplateNode } from '@/schemas/neo4j'

interface ItpRegisterProps {
  projectId: string
}

export default function ItpRegister({ projectId }: ItpRegisterProps) {
  const [itpRecords, setItpRecords] = useState<ITPTemplateNode[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItpRecords = useCallback(async () => {
    try {
      const response = await fetch(`/api/neo4j/${projectId}/itp-templates`)
      if (response.ok) {
        const result = await response.json()
        const templates: ITPTemplateNode[] = (result.data || []).map((item: ITPTemplateNode) => item)
        setItpRecords(templates)
      }
    } catch (error) {
      console.error('Error fetching ITP records:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchItpRecords()
  }, [fetchItpRecords])

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getApprovalColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'not_required':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
        <h1 className="text-3xl font-bold text-gray-900">ITP Register</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Create ITP
        </Button>
      </div>

      {itpRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ITP records yet</h3>
          <p className="text-gray-500 mb-6">Create inspection and test plans to track quality requirements.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Create ITP
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>ITP Records ({itpRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead>Spec Ref</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itpRecords.map((record) => (
                  <TableRow key={record.docNo}>
                    <TableCell className="font-medium">{record.description || record.docNo}</TableCell>
                    <TableCell className="capitalize">{record.workType?.replace(/_/g, ' ') || 'template'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getApprovalColor(record.approvalStatus)}>
                        {record.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>v{record.revisionNumber}</TableCell>
                    <TableCell>{record.specRef || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Approve
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
