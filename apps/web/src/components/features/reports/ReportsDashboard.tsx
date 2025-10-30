'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

interface ReportData {
  total_documents: number
  active_inspections: number
  completed_tests: number
  open_incidents: number
  handover_progress: number
  total_inspections?: number
  approved?: number
  rejected?: number
  avg_completion_days?: number
}

interface ReportsDashboardProps {
  projectId: string
}

export default function ReportsDashboard({ projectId }: ReportsDashboardProps) {
  const [reportType, setReportType] = useState('quality_dashboard')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        projectId,
        type: reportType
      })

      if (dateRange.from) params.set('dateFrom', dateRange.from.toISOString())
      if (dateRange.to) params.set('dateTo', dateRange.to.toISOString())

      const response = await fetch(`/api/v1/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, reportType, dateRange.from, dateRange.to])

  useEffect(() => {
    if (reportType) {
      generateReport()
    }
  }, [generateReport, reportType])

  const reportTypes = [
    { value: 'quality_dashboard', label: 'Quality Dashboard' },
    { value: 'inspection_summary', label: 'Inspection Summary' },
    { value: 'lot_progress', label: 'Lot Progress' },
    { value: 'hse_incidents', label: 'HSE Incidents' },
    { value: 'project_overview', label: 'Project Overview' }
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <Button className="bg-primary hover:bg-primary/90">
          Export Report
        </Button>
      </div>

      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={generateReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportType === 'quality_dashboard' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reportData.total_documents}</div>
                  <p className="text-sm text-gray-600">Processed documents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Inspections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{reportData.active_inspections}</div>
                  <p className="text-sm text-gray-600">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{reportData.completed_tests}</div>
                  <p className="text-sm text-gray-600">Tests passed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Handover Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{reportData.handover_progress}%</div>
                  <p className="text-sm text-gray-600">Records delivered</p>
                </CardContent>
              </Card>
            </>
          )}

          {reportType === 'inspection_summary' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Inspections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reportData.total_inspections || 0}</div>
                  <p className="text-sm text-gray-600">All inspections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{reportData.approved || 0}</div>
                  <p className="text-sm text-gray-600">Passed inspections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{reportData.rejected || 0}</div>
                  <p className="text-sm text-gray-600">Failed inspections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg. Completion Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reportData.avg_completion_days || 0}</div>
                  <p className="text-sm text-gray-600">Days</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}