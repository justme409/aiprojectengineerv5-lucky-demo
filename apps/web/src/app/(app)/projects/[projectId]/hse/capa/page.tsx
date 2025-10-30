'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Target, Users, Calendar, CheckCircle } from 'lucide-react'

export default function CapaPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CAPA Tracking</h1>
          <p className="text-gray-600 mt-2">Corrective and Preventive Actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          New CAPA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">28</div>
          <div className="text-sm text-gray-600">Total CAPAs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">5</div>
          <div className="text-sm text-gray-600">Open</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">89%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CAPA Management</h3>
          <p className="text-gray-600">Track corrective and preventive actions from incidents and audits</p>
        </div>
      </div>
    </div>
  )
}
