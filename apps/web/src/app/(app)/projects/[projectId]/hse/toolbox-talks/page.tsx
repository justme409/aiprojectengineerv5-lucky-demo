'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, MessageSquare, Users, Calendar, CheckCircle } from 'lucide-react'

export default function ToolboxTalksPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toolbox Talks</h1>
          <p className="text-gray-600 mt-2">Daily safety briefings and toolbox meetings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          New Toolbox Talk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">24</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">156</div>
          <div className="text-sm text-gray-600">Total Talks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">98%</div>
          <div className="text-sm text-gray-600">Attendance Rate</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Toolbox Talks Register</h3>
          <p className="text-gray-600">Manage daily safety briefings and track attendance</p>
        </div>
      </div>
    </div>
  )
}
