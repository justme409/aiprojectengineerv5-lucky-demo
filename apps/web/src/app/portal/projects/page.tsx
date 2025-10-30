'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ClientProjectList from '@/components/features/client-portal/ClientProjectList'

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        const response = await fetch('/api/v1/client/projects', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include session cookies
        })

        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])
        } else if (response.status === 401) {
          console.error('Authentication required for client projects')
          setProjects([])
        } else {
          console.error('Failed to fetch client projects:', response.statusText)
          setProjects([])
        }
      } catch (error) {
        console.error('Error fetching client projects:', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchClientProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-2">Access your project information and documentation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  My Projects
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Documents
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Reports
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Support
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-900">New inspection report available</p>
                      <p className="text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-900">Quality certificate approved</p>
                      <p className="text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-900">Meeting scheduled for tomorrow</p>
                      <p className="text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ClientProjectList />
          </div>
        </div>
      </div>
    </div>
  )
}