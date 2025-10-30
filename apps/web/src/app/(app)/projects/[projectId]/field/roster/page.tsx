'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Users, Calendar, MapPin, Phone, Mail, User, Edit, Eye } from 'lucide-react'

interface RosterEntry {
  id: string
  employee_id: string
  name: string
  role: string
  contact_number: string
  email: string
  location: string
  shift_start: string
  shift_end: string
  status: 'scheduled' | 'present' | 'absent' | 'late'
  emergency_contact: {
    name: string
    relationship: string
    phone: string
  }
  certifications: string[]
  equipment_assigned: string[]
  notes: string
}

export default function RosterPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedEntry, setSelectedEntry] = useState<RosterEntry | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchRoster = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/field/roster?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setRoster(data.roster || [])
      }
    } catch (error) {
      console.error('Error fetching roster:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, selectedDate])

  useEffect(() => {
    fetchRoster()
  }, [fetchRoster])

  const filteredRoster = selectedLocation === 'all'
    ? roster
    : roster.filter(entry => entry.location === selectedLocation)

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-muted text-foreground',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-orange-100 text-orange-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅'
      case 'absent': return '❌'
      case 'late': return '⏰'
      default: return '📅'
    }
  }

  // Calculate attendance stats
  const attendanceStats = roster.reduce((acc, entry) => ({
    total: acc.total + 1,
    present: acc.present + (entry.status === 'present' ? 1 : 0),
    absent: acc.absent + (entry.status === 'absent' ? 1 : 0),
    late: acc.late + (entry.status === 'late' ? 1 : 0)
  }), { total: 0, present: 0, absent: 0, late: 0 })

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
          <h1 className="text-3xl font-bold text-gray-900">Site Roster</h1>
          <p className="text-gray-600 mt-2">Daily personnel and attendance tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            📊 Export Report
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Personnel
          </button>
        </div>
      </div>

      {/* Date and Location Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <label className="font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <label className="font-medium text-gray-700">Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Locations</option>
              <option value="site-a">Site A</option>
              <option value="site-b">Site B</option>
              <option value="office">Office</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{attendanceStats.total}</div>
          <div className="text-sm text-gray-600">Total Personnel</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
          <div className="text-sm text-gray-600">Present</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
          <div className="text-sm text-gray-600">Absent</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{attendanceStats.late}</div>
          <div className="text-sm text-gray-600">Late</div>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoster.map((entry) => (
          <div key={entry.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                    <p className="text-sm text-gray-600">{entry.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg mb-1">{getStatusIcon(entry.status)}</div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(entry.status)}`}>
                    {entry.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{entry.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{entry.shift_start} - {entry.shift_end}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{entry.contact_number}</span>
                </div>

                {entry.certifications.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 bg-green-100 rounded mt-0.5"></div>
                    <div>
                      <div className="font-medium text-gray-900">Certifications:</div>
                      <div className="text-gray-600">{entry.certifications.join(', ')}</div>
                    </div>
                  </div>
                )}

                {entry.equipment_assigned.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 bg-muted rounded mt-0.5"></div>
                    <div>
                      <div className="font-medium text-gray-900">Equipment:</div>
                      <div className="text-gray-600">{entry.equipment_assigned.join(', ')}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-primary rounded hover:bg-muted text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoster.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Personnel Scheduled</h3>
          <p className="text-gray-600 mb-6">
            No personnel are scheduled for {new Date(selectedDate).toLocaleDateString()}
            {selectedLocation !== 'all' && ` at ${selectedLocation}`}
          </p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Schedule Personnel
          </button>
        </div>
      )}

      {/* Personnel Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEntry.name}</h2>
                    <p className="text-gray-600">{selectedEntry.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedEntry.status)}`}>
                    {selectedEntry.status}
                  </span>
                  <button
                    onClick={() => setSelectedEntry(null)}
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
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedEntry.contact_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedEntry.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedEntry.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Shift Information</h3>
                  <div className="space-y-2">
                    <div><strong>Start Time:</strong> {selectedEntry.shift_start}</div>
                    <div><strong>End Time:</strong> {selectedEntry.shift_end}</div>
                    <div><strong>Employee ID:</strong> {selectedEntry.employee_id}</div>
                  </div>
                </div>
              </div>

              {selectedEntry.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.equipment_assigned.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assigned Equipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.equipment_assigned.map((equipment, index) => (
                      <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">{selectedEntry.emergency_contact.name}</div>
                  <div className="text-sm text-red-700">{selectedEntry.emergency_contact.relationship}</div>
                  <div className="text-sm text-red-700">{selectedEntry.emergency_contact.phone}</div>
                </div>
              </div>

              {selectedEntry.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedEntry.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
