'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface SWMS {
  id: string
  name: string
  content: {
    hazards: string[]
    controls: string[]
    roles_required: string[]
    expiry_date: string
    status: string
  }
  status: string
  created_at: string
}

interface SwmsRegisterProps {
  projectId: string
}

export default function SwmsRegister({ projectId }: SwmsRegisterProps) {
  const [swms, setSwms] = useState<SWMS[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSWMS = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/hse?projectId=${projectId}&type=swms`)
      if (response.ok) {
        const data = await response.json()
        setSwms(data.hse_records)
      }
    } catch (error) {
      console.error('Error fetching SWMS:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSWMS()
  }, [fetchSWMS])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
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
        <h1 className="text-3xl font-bold text-gray-900">SWMS Register</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Create SWMS
        </Button>
      </div>

      {swms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SWMS documents yet</h3>
          <p className="text-gray-500 mb-6">Create Safe Work Method Statements for your project activities.</p>
          <Button className="bg-primary hover:bg-primary/90">
            Create SWMS
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>SWMS Documents ({swms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Hazards</TableHead>
                  <TableHead>Controls</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {swms.map((swmsDoc) => (
                  <TableRow key={swmsDoc.id}>
                    <TableCell className="font-medium">{swmsDoc.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {swmsDoc.content.hazards.slice(0, 2).map((hazard, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {hazard}
                          </Badge>
                        ))}
                        {swmsDoc.content.hazards.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{swmsDoc.content.hazards.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {swmsDoc.content.controls.length} controls
                    </TableCell>
                    <TableCell>
                      <span className={isExpired(swmsDoc.content.expiry_date) ? 'text-red-600 font-medium' : ''}>
                        {new Date(swmsDoc.content.expiry_date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(swmsDoc.content.status)}>
                        {isExpired(swmsDoc.content.expiry_date) ? 'Expired' : swmsDoc.content.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Review
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