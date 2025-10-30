'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, AlertTriangle, Users, Calendar, TrendingUp } from 'lucide-react'

export default function IncidentsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Register</h1>
          <p className="text-gray-600 mt-2">Report and investigate safety incidents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-gray-600">Total Incidents</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-gray-600">Open Investigations</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">1</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">0.08</div>
          <div className="text-sm text-gray-600">LTIFR</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Incident Management</h3>
          <p className="text-gray-600">Comprehensive incident reporting and investigation system</p>
        </div>
      </div>
    </div>
  )
}
