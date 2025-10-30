'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Truck, Wrench, AlertTriangle, CheckCircle, Clock, MapPin, Fuel, Settings, Eye, Edit } from 'lucide-react'

interface PlantItem {
  id: string
  name: string
  type: 'truck' | 'excavator' | 'dozer' | 'loader' | 'crane' | 'generator' | 'other'
  registration: string
  make: string
  model: string
  year: number
  location: string
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service'
  operator?: string
  last_service: string
  next_service_due: string
  fuel_level?: number
  hours_used: number
  daily_check_completed: boolean
  issues: string[]
  notes: string
}

export default function PlantPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [plant, setPlant] = useState<PlantItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchPlant = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/field/plant`)
      if (response.ok) {
        const data = await response.json()
        setPlant(data.plant || [])
      }
    } catch (error) {
      console.error('Error fetching plant:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPlant()
  }, [fetchPlant])

  const filteredPlant = plant.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'truck': return '🚛'
      case 'excavator': return '🏗️'
      case 'dozer': return '🚜'
      case 'loader': return '⛏️'
      case 'crane': return '🏗️'
      case 'generator': return '⚡'
      default: return '🔧'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      in_use: 'bg-muted text-foreground',
      maintenance: 'bg-orange-100 text-orange-800',
      out_of_service: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const isServiceOverdue = (nextService: string) => {
    return new Date(nextService) < new Date()
  }

  const needsMaintenance = (item: PlantItem) => {
    return isServiceOverdue(item.next_service_due) || item.issues.length > 0
  }

  // Calculate stats
  const stats = plant.reduce((acc, item) => ({
    total: acc.total + 1,
    available: acc.available + (item.status === 'available' ? 1 : 0),
    in_use: acc.in_use + (item.status === 'in_use' ? 1 : 0),
    maintenance: acc.maintenance + (item.status === 'maintenance' ? 1 : 0),
    needs_service: acc.needs_service + (needsMaintenance(item) ? 1 : 0)
  }), { total: 0, available: 0, in_use: 0, maintenance: 0, needs_service: 0 })

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
          <h1 className="text-3xl font-bold text-gray-900">Plant & Equipment</h1>
          <p className="text-gray-600 mt-2">Fleet management and equipment tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            📊 Fleet Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            🛠️ Maintenance Schedule
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="truck">Trucks</option>
              <option value="excavator">Excavators</option>
              <option value="dozer">Dozers</option>
              <option value="loader">Loaders</option>
              <option value="crane">Cranes</option>
              <option value="generator">Generators</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Equipment</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.in_use}</div>
          <div className="text-sm text-gray-600">In Use</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
          <div className="text-sm text-gray-600">In Maintenance</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.needs_service}</div>
          <div className="text-sm text-gray-600">Needs Service</div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlant.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getTypeIcon(item.type)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.make} {item.model} ({item.year})</p>
                    <p className="text-xs text-gray-500">{item.registration}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {needsMaintenance(item) && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{item.location}</span>
                </div>

                {item.operator && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <span>Operator: {item.operator}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{item.hours_used}h used</span>
                </div>

                {item.fuel_level !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span>Fuel: {item.fuel_level}%</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Next Service: {new Date(item.next_service_due).toLocaleDateString()}</span>
                  {isServiceOverdue(item.next_service_due) && (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>

                {item.daily_check_completed ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Daily check completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span>Daily check pending</span>
                  </div>
                )}

                {item.issues.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Issues ({item.issues.length})
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {item.issues.slice(0, 2).map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                      {item.issues.length > 2 && (
                        <li>• +{item.issues.length - 2} more issues</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedPlant(item)}
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

      {filteredPlant.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Equipment Found</h3>
          <p className="text-gray-600 mb-6">
            No equipment found matching the selected filters
          </p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      )}

      {/* Equipment Detail Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{getTypeIcon(selectedPlant.type)}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPlant.name}</h2>
                    <p className="text-gray-600">{selectedPlant.make} {selectedPlant.model} ({selectedPlant.year})</p>
                    <p className="text-sm text-gray-500">Reg: {selectedPlant.registration}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedPlant.status)}`}>
                    {selectedPlant.status}
                  </span>
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Equipment Details</h3>
                  <div className="space-y-2">
                    <div><strong>Type:</strong> {selectedPlant.type}</div>
                    <div><strong>Location:</strong> {selectedPlant.location}</div>
                    <div><strong>Hours Used:</strong> {selectedPlant.hours_used}h</div>
                    {selectedPlant.fuel_level !== undefined && (
                      <div><strong>Fuel Level:</strong> {selectedPlant.fuel_level}%</div>
                    )}
                    <div><strong>Last Service:</strong> {new Date(selectedPlant.last_service).toLocaleDateString()}</div>
                    <div><strong>Next Service Due:</strong> {new Date(selectedPlant.next_service_due).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Operational Status</h3>
                  <div className="space-y-3">
                    {selectedPlant.operator && (
                      <div><strong>Current Operator:</strong> {selectedPlant.operator}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <strong>Daily Check:</strong>
                      {selectedPlant.daily_check_completed ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </div>
                    {selectedPlant.issues.length > 0 && (
                      <div>
                        <strong>Active Issues:</strong>
                        <ul className="mt-1 space-y-1">
                          {selectedPlant.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-red-600">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedPlant.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700">{selectedPlant.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
