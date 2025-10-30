'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'

interface CAPA {
  id: string
  name: string
  content: {
    root_cause: string
    corrective_actions: string[]
    preventive_actions: string[]
    responsible_party: string
    target_completion: string
    status: string
    incident_id: string
  }
  status: string
  created_at: string
}

interface CapaTrackingProps {
  projectId: string
}

export default function CapaTracking({ projectId }: CapaTrackingProps) {
  const [capas, setCapas] = useState<CAPA[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCAPAs = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/hse?projectId=${projectId}&type=capa`)
      if (response.ok) {
        const data = await response.json()
        setCapas(data.hse_records)
      }
    } catch (error) {
      console.error('Error fetching CAPAs:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchCAPAs()
  }, [fetchCAPAs])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-muted text-foreground'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date()
  }

  const calculateProgress = (capa: CAPA) => {
    // If CAPA is completed, return 100%
    if (capa.status === 'completed') {
      return 100
    }

    // Calculate progress based on completed actions
    if (capa.status === 'completed') {
      return 100
    }

    // Count total actions and completed ones
    const correctiveActions = capa.content.corrective_actions || []
    const preventiveActions = capa.content.preventive_actions || []
    const totalActions = correctiveActions.length + preventiveActions.length

    if (totalActions === 0) {
      // No actions defined - use time-based estimation as fallback
      const now = new Date()
      const targetDate = new Date(capa.content.target_completion)
      const createdDate = new Date(capa.created_at)

      if (targetDate <= now) {
        return 80 // Overdue items get 80% progress
      }

      const totalTime = targetDate.getTime() - createdDate.getTime()
      const elapsedTime = now.getTime() - createdDate.getTime()
      const timeProgress = Math.min((elapsedTime / totalTime) * 100, 90)
      return Math.max(10, Math.floor(timeProgress))
    }

    // Count completed actions based on completion tracking
    let completedActions = 0

    // Check if actions have completion tracking
    const completedList = (capa as any)?.content?.completed_actions as string[] | undefined
    if (Array.isArray(completedList)) {
      completedActions = completedList.length
    } else {
      // Estimate completion based on status and time
      const now = new Date()
      const targetDate = new Date(capa.content.target_completion)
      const createdDate = new Date(capa.created_at)

      if (capa.status === 'in_progress') {
        const totalTime = targetDate.getTime() - createdDate.getTime()
        const elapsedTime = now.getTime() - createdDate.getTime()
        const timeRatio = Math.min(elapsedTime / totalTime, 1)
        completedActions = Math.floor(totalActions * timeRatio * 0.8) // Assume 80% of time progress equals action completion
      }
    }

    const progress = totalActions > 0 ? Math.floor((completedActions / totalActions) * 100) : 0
    return Math.max(0, Math.min(95, progress)) // Cap at 95% until officially completed
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
        <h1 className="text-3xl font-bold text-gray-900">CAPA Tracking</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Create CAPA
        </Button>
      </div>

      {capas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CAPA records yet</h3>
          <p className="text-gray-500 mb-6">Corrective and Preventive Action records will be tracked here.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Create CAPA
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>CAPA Records ({capas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Root Cause</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capas.map((capa) => (
                  <TableRow key={capa.id}>
                    <TableCell className="font-medium">{capa.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {capa.content.root_cause}
                    </TableCell>
                    <TableCell>
                      {capa.content.corrective_actions.length + capa.content.preventive_actions.length} actions
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <Progress value={calculateProgress(capa)} className="h-2" />
                        <span className="text-xs text-gray-500 mt-1">
                          {calculateProgress(capa)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={isOverdue(capa.content.target_completion) ? 'text-red-600 font-medium' : ''}>
                        {new Date(capa.content.target_completion).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(capa.content.status)}>
                        {capa.content.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Update Progress
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
