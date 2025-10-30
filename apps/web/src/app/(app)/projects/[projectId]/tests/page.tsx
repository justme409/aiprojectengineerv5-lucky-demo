'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, TestTube, CheckCircle, Clock, AlertTriangle, FileText, Calendar, MapPin, User, Eye, Edit, Beaker as FlaskIcon } from 'lucide-react'

interface TestRecord {
  id: string
  test_request_id: string
  test_method_code: string
  test_method_name: string
  sample_id: string
  sample_description: string
  lab_name: string
  lab_accreditation: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  scheduled_date: string
  completed_date?: string
  due_date: string
  result_values: Record<string, any>
  pass_fail: 'pass' | 'fail' | 'pending'
  report_id?: string
  report_date?: string
  technician: string
  notes: string
  location: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export default function TestsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [tests, setTests] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchTests = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tests`)
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.test_method_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.sample_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_request_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-muted text-foreground',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-muted text-foreground',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getResultBadge = (result: string) => {
    const colors = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return colors[result as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && status !== 'cancelled' && new Date(dueDate) < new Date()
  }

  // Calculate stats
  const stats = tests.reduce((acc, test) => ({
    total: acc.total + 1,
    scheduled: acc.scheduled + (test.status === 'scheduled' ? 1 : 0),
    in_progress: acc.in_progress + (test.status === 'in_progress' ? 1 : 0),
    completed: acc.completed + (test.status === 'completed' ? 1 : 0),
    failed: acc.failed + (test.status === 'failed' ? 1 : 0),
    overdue: acc.overdue + (isOverdue(test.due_date, test.status) ? 1 : 0)
  }), { total: 0, scheduled: 0, in_progress: 0, completed: 0, failed: 0, overdue: 0 })

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
          <h1 className="text-3xl font-bold text-gray-900">Test Register</h1>
          <p className="text-gray-600 mt-2">Laboratory testing and results management</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <FileText className="w-4 h-4" />
            Export Results
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Test
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tests</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.scheduled}</div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lab
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{test.test_method_code}: {test.test_method_name}</div>
                      <div className="text-sm text-gray-600">Sample: {test.sample_description}</div>
                      <div className="text-xs text-gray-500">Request: {test.test_request_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(test.priority)}`}>
                      {test.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(test.status)}`}>
                        {test.status}
                      </span>
                      {isOverdue(test.due_date, test.status) && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultBadge(test.pass_fail)}`}>
                      {test.pass_fail}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isOverdue(test.due_date, test.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(test.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{test.lab_name}</div>
                      <div className="text-sm text-gray-600">{test.lab_accreditation}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTest(test)}
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
                      {test.report_id && (
                        <button
                          className="p-1 text-gray-400 hover:text-primary"
                          title="Download Report"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <FlaskIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No tests have been scheduled yet'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Schedule Test
              </button>
            )}
          </div>
        )}
      </div>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTest.test_method_code}: {selectedTest.test_method_name}</h2>
                  <p className="text-gray-600">Sample: {selectedTest.sample_description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadge(selectedTest.priority)}`}>
                    {selectedTest.priority}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getResultBadge(selectedTest.pass_fail)}`}>
                    {selectedTest.pass_fail}
                  </span>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Information</h3>
                  <div className="space-y-2">
                    <div><strong>Test Request ID:</strong> {selectedTest.test_request_id}</div>
                    <div><strong>Sample ID:</strong> {selectedTest.sample_id}</div>
                    <div><strong>Scheduled Date:</strong> {new Date(selectedTest.scheduled_date).toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> {new Date(selectedTest.due_date).toLocaleDateString()}</div>
                    {selectedTest.completed_date && (
                      <div><strong>Completed Date:</strong> {new Date(selectedTest.completed_date).toLocaleDateString()}</div>
                    )}
                    <div><strong>Technician:</strong> {selectedTest.technician}</div>
                    <div><strong>Location:</strong> {selectedTest.location}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Laboratory Details</h3>
                  <div className="space-y-2">
                    <div><strong>Lab Name:</strong> {selectedTest.lab_name}</div>
                    <div><strong>Accreditation:</strong> {selectedTest.lab_accreditation}</div>
                    {selectedTest.report_id && (
                      <div><strong>Report ID:</strong> {selectedTest.report_id}</div>
                    )}
                    {selectedTest.report_date && (
                      <div><strong>Report Date:</strong> {new Date(selectedTest.report_date).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>

              {Object.keys(selectedTest.result_values).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedTest.result_values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedTest.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedTest.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
