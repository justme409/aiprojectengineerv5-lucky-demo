'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Clock, Calendar, User, CheckCircle, AlertCircle, Edit, Eye, Download } from 'lucide-react'

interface TimesheetEntry {
  id: string
  employee_id: string
  employee_name: string
  date: string
  start_time: string
  end_time: string
  break_duration: number // minutes
  regular_hours: number
  overtime_hours: number
  total_hours: number
  work_description: string
  location: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_date?: string
  approved_date?: string
  approved_by?: string
  week_start: string
  week_end: string
}

export default function TimesheetsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date()
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    return monday.toISOString().split('T')[0]
  })
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetEntry | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchTimesheets = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/field/timesheets?week=${selectedWeek}`)
      if (response.ok) {
        const data = await response.json()
        setTimesheets(data.timesheets || [])
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, selectedWeek])

  useEffect(() => {
    fetchTimesheets()
  }, [fetchTimesheets])

  const getWeekRange = (startDate: string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString()
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredTimesheets = selectedEmployee === 'all'
    ? timesheets
    : timesheets.filter(t => t.employee_id === selectedEmployee)

  const weekRange = getWeekRange(selectedWeek)

  // Calculate weekly totals
  const weeklyTotals = filteredTimesheets.reduce((acc, entry) => ({
    regular: acc.regular + entry.regular_hours,
    overtime: acc.overtime + entry.overtime_hours,
    total: acc.total + entry.total_hours
  }), { regular: 0, overtime: 0, total: 0 })

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600 mt-2">Labor tracking and time management</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Week
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Timesheet
          </button>
        </div>
      </div>

      {/* Week Selector and Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <label className="font-medium text-gray-700">Week Starting:</label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="text-sm text-gray-600">
            {weekRange.start} - {weekRange.end}
          </div>
          <div className="flex-1"></div>
          <div>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Employees</option>
              {/* TODO: Populate from employees API */}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{weeklyTotals.total.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{weeklyTotals.regular.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Regular Hours</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{weeklyTotals.overtime.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Overtime Hours</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{filteredTimesheets.length}</div>
          <div className="text-sm text-gray-600">Timesheets</div>
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTimesheets.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{entry.employee_name}</div>
                        <div className="text-sm text-gray-500">{entry.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{entry.total_hours.toFixed(1)}h</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.regular_hours.toFixed(1)} reg • {entry.overtime_hours.toFixed(1)} OT
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.work_description}>
                      {entry.work_description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTimesheet(entry)}
                        className="p-1 text-gray-400 hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {entry.status === 'submitted' && (
                        <button
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTimesheets.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timesheets Found</h3>
            <p className="text-gray-600 mb-4">
              No timesheets found for the selected week and filters
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Timesheet
            </button>
          </div>
        )}
      </div>

      {/* Timesheet Detail Modal */}
      {selectedTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTimesheet.employee_name}</h2>
                  <p className="text-gray-600">{new Date(selectedTimesheet.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedTimesheet.status)}`}>
                    {selectedTimesheet.status}
                  </span>
                  <button
                    onClick={() => setSelectedTimesheet(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Time Details</h3>
                  <div className="space-y-2">
                    <div><strong>Start Time:</strong> {selectedTimesheet.start_time}</div>
                    <div><strong>End Time:</strong> {selectedTimesheet.end_time}</div>
                    <div><strong>Break Duration:</strong> {selectedTimesheet.break_duration} minutes</div>
                    <div><strong>Regular Hours:</strong> {selectedTimesheet.regular_hours.toFixed(1)}h</div>
                    <div><strong>Overtime Hours:</strong> {selectedTimesheet.overtime_hours.toFixed(1)}h</div>
                    <div><strong>Total Hours:</strong> {selectedTimesheet.total_hours.toFixed(1)}h</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Work Details</h3>
                  <div className="space-y-2">
                    <div><strong>Location:</strong> {selectedTimesheet.location}</div>
                    <div><strong>Description:</strong></div>
                    <p className="text-sm text-gray-700 mt-1">{selectedTimesheet.work_description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Approval Status</h3>
                <div className="space-y-2">
                  {selectedTimesheet.submitted_date && (
                    <div><strong>Submitted:</strong> {new Date(selectedTimesheet.submitted_date).toLocaleString()}</div>
                  )}
                  {selectedTimesheet.approved_date && selectedTimesheet.approved_by && (
                    <div><strong>Approved:</strong> {new Date(selectedTimesheet.approved_date).toLocaleString()} by {selectedTimesheet.approved_by}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
