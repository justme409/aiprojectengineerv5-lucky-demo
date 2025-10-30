'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface NCR {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  reportedBy: string
  reportedAt: string
  resolvedBy?: string
  resolvedAt?: string
  category: string
  location?: string
  correctiveAction?: string
}

export default function NcrsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [ncrs, setNcrs] = useState<NCR[]>([])
  const [filteredNcrs, setFilteredNcrs] = useState<NCR[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  useEffect(() => {
    const fetchNCRs = async () => {
      try {
        setLoading(true)
        // Fetch NCRs from assets
        const response = await fetch(`/api/v1/assets?project_id=${projectId}&type=ncr`)
        if (response.ok) {
          const data = await response.json()
          const transformedNcrs = transformAssetsToNCRs(data.assets || [])
          setNcrs(transformedNcrs)
        }
      } catch (error) {
        console.error('Error fetching NCRs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNCRs()
  }, [projectId])

  useEffect(() => {
    const filterNCRs = () => {
      let filtered = ncrs

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(ncr =>
          ncr.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ncr.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ncr.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(ncr => ncr.status === statusFilter)
      }

      // Apply severity filter
      if (severityFilter !== 'all') {
        filtered = filtered.filter(ncr => ncr.severity === severityFilter)
      }

      setFilteredNcrs(filtered)
    }

    filterNCRs()
  }, [ncrs, searchTerm, statusFilter, severityFilter])


  const transformAssetsToNCRs = (assets: any[]): NCR[] => {
    return assets.map(asset => ({
      id: asset.id,
      title: asset.name,
      description: asset.content?.description || '',
      severity: asset.content?.severity || 'medium',
      status: asset.status === 'active' ? 'open' : asset.status,
      reportedBy: asset.content?.reported_by || 'Unknown',
      reportedAt: asset.created_at,
      resolvedBy: asset.content?.resolved_by,
      resolvedAt: asset.content?.resolved_at,
      category: asset.content?.category || 'General',
      location: asset.content?.location,
      correctiveAction: asset.content?.corrective_action
    }))
  }


  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'destructive',
      critical: 'destructive'
    } as const

    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    }

    return (
      <Badge variant={variants[severity as keyof typeof variants]}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      investigating: 'outline',
      resolved: 'secondary',
      closed: 'default'
    } as const

    const labels = {
      open: 'Open',
      investigating: 'Investigating',
      resolved: 'Resolved',
      closed: 'Closed'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'investigating':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'open':
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <h1 className="text-3xl font-bold mb-8 h-8 bg-gray-200 rounded w-1/3"></h1>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Non-Conformance Reports</h1>
          <p className="text-gray-600 mt-2">
            View and track non-conformance reports and corrective actions for your project.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NCRs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ncrs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {ncrs.filter(ncr => ncr.status === 'open').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {ncrs.filter(ncr => ncr.status === 'resolved' || ncr.status === 'closed').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {ncrs.filter(ncr => ncr.severity === 'high' || ncr.severity === 'critical').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search NCRs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* NCRs Table */}
        <Card>
          <CardHeader>
            <CardTitle>NCR Reports</CardTitle>
            <CardDescription>
              {filteredNcrs.length} of {ncrs.length} reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNcrs.map((ncr) => (
                  <TableRow key={ncr.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ncr.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {ncr.description}
                        </div>
                        {ncr.location && (
                          <div className="text-xs text-muted-foreground">
                            Location: {ncr.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(ncr.severity)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ncr.status)}
                        {getStatusBadge(ncr.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ncr.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(ncr.reportedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center mt-1">
                          <User className="mr-1 h-3 w-3" />
                          {ncr.reportedBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredNcrs.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No NCRs Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No non-conformance reports have been filed for this project yet.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Back to Project */}
        <div className="flex justify-center mt-8">
          <Link href={`/portal/projects/${projectId}/dashboard`}>
            <Button variant="outline">
              Back to Project Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
