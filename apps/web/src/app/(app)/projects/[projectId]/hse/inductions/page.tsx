'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, GraduationCap, Users, Calendar, CheckCircle } from 'lucide-react'

export default function InductionsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Inductions</h1>
          <p className="text-gray-600 mt-2">Site induction management and tracking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          New Induction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">45</div>
          <div className="text-sm text-gray-600">Total Inductions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">8</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">95%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inductions Register</h3>
          <p className="text-gray-600">Manage site inductions and track completion status</p>
        </div>
      </div>
    </div>
  )
}
