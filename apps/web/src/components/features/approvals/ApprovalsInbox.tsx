'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ApprovalItem {
  id: string
  name: string
  type: string
  content: {
    requested_by: string
    requested_at: string
    due_date: string
    priority: string
  }
  status: string
  created_at: string
}

interface ApprovalsInboxProps {
  projectId: string
  userId?: string
}

export default function ApprovalsInbox({ projectId, userId }: ApprovalsInboxProps) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApprovals = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/approvals/workflows?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setApprovals(data.workflows.filter((w: ApprovalItem) => w.status === 'pending'))
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/v1/approvals/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approvalId,
          action: 'decide',
          decision: action
        })
      })

      if (response.ok) {
        fetchApprovals() // Refresh data
      }
    } catch (error) {
      console.error(`Error ${action}ing item:`, error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
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
        <h1 className="text-3xl font-bold text-gray-900">Approvals Inbox</h1>
        <div className="text-sm text-gray-600">
          {approvals.length} pending approval{approvals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
          <p className="text-gray-500">All caught up! New approval requests will appear here.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell className="font-medium">{approval.name}</TableCell>
                    <TableCell className="capitalize">{approval.type.replace('_', ' ')}</TableCell>
                    <TableCell>{approval.content.requested_by}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(approval.content.priority)}>
                        {approval.content.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={isOverdue(approval.content.due_date) ? 'text-red-600 font-medium' : ''}>
                        {new Date(approval.content.due_date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(approval.content.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprovalAction(approval.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleApprovalAction(approval.id, 'reject')}
                        >
                          Reject
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
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