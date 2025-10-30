'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface ITPTemplate {
  id: string
  name: string
  version: number
  approval_state: string
  jurisdiction_coverage_status: string
  required_points_present: string
  created_at: string
}

interface ClientItpTemplateListProps {
  projectId: string
}

export default function ClientItpTemplateList({ projectId }: ClientItpTemplateListProps) {
  const [templates, setTemplates] = useState<ITPTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    try {
      // Use itp-register API and map to template-like rows for portal
      const response = await fetch(`/api/v1/projects/${projectId}/quality/itp-register`)
      if (response.ok) {
        const data = await response.json()
        const rows = (data.itpRegister || data.itp_register || data.templates || []).map((r: any) => ({
          id: r.id || r.itp_asset_id,
          name: r.name,
          version: r.version || r.content?.version || 1,
          approval_state: r.approval_state || r.status || 'draft',
          jurisdiction_coverage_status: r.jurisdiction_coverage_status || r.content?.coverage || 'unknown',
          required_points_present: String(r.required_points_present ?? true),
          created_at: r.created_at || new Date().toISOString(),
        }))
        setTemplates(rows)
      }
    } catch (error) {
      console.error('Error fetching ITP templates:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const getStatusBadge = (state: string) => {
    switch (state.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  const getCoverageStatus = (template: ITPTemplate) => {
    const coverage = template.jurisdiction_coverage_status
    const pointsPresent = template.required_points_present

    if (coverage === 'complete' && pointsPresent === 'true') {
      return <Badge className="bg-green-100 text-green-800">Complete</Badge>
    } else if (coverage === 'partial' || pointsPresent === 'false') {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Incomplete</Badge>
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
        <h1 className="text-3xl font-bold">ITP Templates Register</h1>
        <Button variant="outline">Download All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.approval_state === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {templates.filter(t => t.approval_state === 'pending_review').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ITP Templates Register</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No ITP templates available yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{getStatusBadge(template.approval_state)}</TableCell>
                    <TableCell>{getCoverageStatus(template)}</TableCell>
                    <TableCell>v{template.version}</TableCell>
                    <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
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
