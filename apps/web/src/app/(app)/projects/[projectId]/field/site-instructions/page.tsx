'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, FileText, AlertCircle, CheckCircle, Clock, Users, MapPin, Eye, Edit, Download } from 'lucide-react'

interface SiteInstruction {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  location: string
  assigned_to: string[]
  due_date: string
  status: 'draft' | 'issued' | 'acknowledged' | 'completed' | 'overdue'
  issued_by: string
  issued_date: string
  acknowledged_by: string[]
  acknowledged_date: string[]
  completion_notes: string
  attachments: string[]
  requires_acknowledgment: boolean
}

export default function SiteInstructionsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [instructions, setInstructions] = useState<SiteInstruction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInstruction, setSelectedInstruction] = useState<SiteInstruction | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchInstructions = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/field/site-instructions`)
      if (response.ok) {
        const data = await response.json()
        setInstructions(data.instructions || [])
      }
    } catch (error) {
      console.error('Error fetching site instructions:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchInstructions()
  }, [fetchInstructions])

  const filteredInstructions = instructions.filter(instruction => {
    const matchesSearch = instruction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instruction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || instruction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-muted text-foreground',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date()
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Instructions</h1>
          <p className="text-gray-600 mt-2">Critical site communications and safety directives</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Instruction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{instructions.length}</div>
          <div className="text-sm text-gray-600">Total Instructions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{instructions.filter(i => i.status === 'issued').length}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{instructions.filter(i => i.status === 'completed').length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{instructions.filter(i => isOverdue(i.due_date, i.status)).length}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{instructions.filter(i => i.priority === 'critical').length}</div>
          <div className="text-sm text-gray-600">Critical Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search instructions..."
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
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instructions List */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instruction Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstructions.map((instruction) => (
                <tr key={instruction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {instruction.priority === 'critical' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        {instruction.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{instruction.description.substring(0, 80)}...</div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {instruction.location}
                        <span>•</span>
                        <FileText className="w-3 h-3" />
                        {instruction.attachments.length} attachments
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(instruction.priority)}`}>
                      {instruction.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(instruction.status)}`}>
                        {instruction.status}
                      </span>
                      {isOverdue(instruction.due_date, instruction.status) && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isOverdue(instruction.due_date, instruction.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(instruction.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{instruction.assigned_to.length} people</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedInstruction(instruction)}
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
                      <button
                        className="p-1 text-gray-400 hover:text-primary"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInstructions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Instructions Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first site instruction'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Instruction
              </button>
            )}
          </div>
        )}
      </div>

      {/* Instruction Detail Modal */}
      {selectedInstruction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedInstruction.priority === 'critical' && <AlertCircle className="w-6 h-6 text-red-600" />}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedInstruction.title}</h2>
                    <p className="text-gray-600">{selectedInstruction.category} • {selectedInstruction.location}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadge(selectedInstruction.priority)}`}>
                    {selectedInstruction.priority}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedInstruction.status)}`}>
                    {selectedInstruction.status}
                  </span>
                  <button
                    onClick={() => setSelectedInstruction(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700">{selectedInstruction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assignment Details</h3>
                  <div className="space-y-3">
                    <div>
                      <strong>Assigned To:</strong>
                      <div className="mt-1 space-y-1">
                        {selectedInstruction.assigned_to.map((person, index) => (
                          <div key={index} className="text-sm text-gray-600">• {person}</div>
                        ))}
                      </div>
                    </div>
                    <div><strong>Issued By:</strong> {selectedInstruction.issued_by}</div>
                    <div><strong>Issued Date:</strong> {new Date(selectedInstruction.issued_date).toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> {new Date(selectedInstruction.due_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acknowledgment Status</h3>
                  <div className="space-y-3">
                    <div>
                      <strong>Acknowledged By:</strong>
                      <div className="mt-1 space-y-1">
                        {selectedInstruction.acknowledged_by.length > 0 ? (
                          selectedInstruction.acknowledged_by.map((person, index) => (
                            <div key={index} className="text-sm text-green-600 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              {person} ({new Date(selectedInstruction.acknowledged_date[index]).toLocaleDateString()})
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No acknowledgments yet</div>
                        )}
                      </div>
                    </div>
                    {selectedInstruction.requires_acknowledgment && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Acknowledgment Required</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedInstruction.completion_notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Completion Notes</h3>
                  <p className="text-gray-700">{selectedInstruction.completion_notes}</p>
                </div>
              )}

              {selectedInstruction.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedInstruction.attachments.map((attachment, index) => (
                      <div key={index} className="p-3 bg-gray-50 border rounded flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-900">{attachment}</span>
                        <button className="ml-auto text-primary hover:text-foreground">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
