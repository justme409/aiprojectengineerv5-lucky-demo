'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, BookOpen, Cloud, Users, Calendar, Clock, Camera, FileText, Edit, Eye } from 'lucide-react'

interface DailyDiary {
  id: string
  date: string
  weather: string
  temperature: number
  crews: string[]
  activities: string[]
  issues: string[]
  photos: string[]
  visitors: string[]
  equipment_used: string[]
  safety_topics: string[]
  incidents: string[]
  created_by: string
  created_at: string
}

export default function DailyDiariesPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [diaries, setDiaries] = useState<DailyDiary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDiary, setSelectedDiary] = useState<DailyDiary | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchDiaries = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/field/daily-diaries`)
      if (response.ok) {
        const data = await response.json()
        setDiaries(data.diaries || [])
      }
    } catch (error) {
      console.error('Error fetching daily diaries:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchDiaries()
  }, [fetchDiaries])

  const currentDiary = diaries.find(d => d.date === selectedDate)

  const getWeatherIcon = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'sunny': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy': return '🌧️'
      case 'windy': return '💨'
      default: return '🌤️'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Daily Diaries</h1>
          <p className="text-gray-600 mt-2">Site operations and progress tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            Calendar View
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Diary Entry
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {currentDiary ? `Last updated: ${new Date(currentDiary.created_at).toLocaleString()}` : 'No entry for selected date'}
          </div>
        </div>
      </div>

      {/* Current Diary Display */}
      {currentDiary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather & Conditions */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Weather & Conditions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">{getWeatherIcon(currentDiary.weather)}</div>
                  <div className="font-medium">{currentDiary.weather}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🌡️</div>
                  <div className="font-medium">{currentDiary.temperature}°C</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">{currentDiary.crews.length} crews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📸</div>
                  <div className="font-medium">{currentDiary.photos.length} photos</div>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Daily Activities
              </h2>
              <div className="space-y-2">
                {currentDiary.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span>{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues & Safety */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚠️ Issues & Safety Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Issues Identified</h3>
                  <div className="space-y-2">
                    {currentDiary.issues.map((issue, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Safety Topics Discussed</h3>
                  <div className="space-y-2">
                    {currentDiary.safety_topics.map((topic, index) => (
                      <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Crews */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Crews
              </h3>
              <div className="space-y-2">
                {currentDiary.crews.map((crew, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    {crew}
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-3">Equipment Used</h3>
              <div className="space-y-2">
                {currentDiary.equipment_used.map((equipment, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    {equipment}
                  </div>
                ))}
              </div>
            </div>

            {/* Visitors */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-3">Site Visitors</h3>
              <div className="space-y-2">
                {currentDiary.visitors.map((visitor, index) => (
                  <div key={index} className="text-sm p-2 bg-purple-50 rounded">
                    {visitor}
                  </div>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photos ({currentDiary.photos.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {currentDiary.photos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    📷
                  </div>
                ))}
                {currentDiary.photos.length > 4 && (
                  <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    +{currentDiary.photos.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm">
                  <Edit className="w-4 h-4" />
                  Edit Entry
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                  <FileText className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Diary Entry</h3>
          <p className="text-gray-600 mb-6">No daily diary entry found for {new Date(selectedDate).toLocaleDateString()}</p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Diary Entry
          </button>
        </div>
      )}

      {/* Recent Diaries Summary */}
      <div className="mt-8 bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Diary Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weather</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {diaries.slice(0, 5).map((diary) => (
                <tr key={diary.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(diary.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getWeatherIcon(diary.weather)} {diary.weather}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {diary.activities.length} activities
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {diary.issues.length > 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {diary.issues.length} issues
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setSelectedDate(diary.date)
                        setSelectedDiary(diary)
                      }}
                      className="text-primary hover:text-foreground"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
