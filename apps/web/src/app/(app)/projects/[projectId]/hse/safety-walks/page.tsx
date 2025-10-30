'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Eye, Users, Calendar, AlertTriangle } from 'lucide-react'

export default function SafetyWalksPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Walks</h1>
          <p className="text-gray-600 mt-2">Site safety inspections and observations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          New Safety Walk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">89</div>
          <div className="text-sm text-gray-600">Total Walks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">23</div>
          <div className="text-sm text-gray-600">Open Issues</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety Walks Register</h3>
          <p className="text-gray-600">Track safety inspections and follow up on identified issues</p>
        </div>
      </div>
    </div>
  )
}
