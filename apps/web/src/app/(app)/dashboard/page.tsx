'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardMetrics {
  // Metrics removed - keeping interface for future use
}

interface RecentProject {
  id: string
  name: string
  updated_at: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics>({})
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user) return

      try {
        setLoading(true)

        // Fetch dashboard data from the dedicated API
        const dashboardResponse = await fetch('/api/v1/dashboard')
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setRecentProjects(dashboardData.recentProjects)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchDashboardData()
    }
  }, [session?.user])

  if (status === 'loading' || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-foreground mb-8 h-8 bg-muted rounded w-1/3"></h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {session.user?.name || 'User'}!
          </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your projects and recent activity.
        </p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border shadow-sm card-interactive p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Recent Projects
          </h3>
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="flex justify-between items-center p-3 bg-gray-500/5 rounded">
                  <div>
                    <p className="font-medium text-card-foreground">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View →
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No projects yet</p>
                <Link
                  href="/projects/new"
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Create your first project
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm card-interactive p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/projects"
              className="p-4 bg-gray-500/5 rounded-lg hover:bg-gray-500/10 transition-colors"
            >
              <div className="text-gray-700 font-medium">View Projects</div>
              <div className="text-sm text-gray-500/70">Manage all projects</div>
            </Link>

            <Link
              href="/account"
              className="p-4 bg-gray-500/5 rounded-lg hover:bg-gray-500/10 transition-colors"
            >
              <div className="text-gray-700 font-medium">Account</div>
              <div className="text-sm text-gray-500/70">Update settings</div>
            </Link>

            <Link
              href="/qse"
              className="p-4 bg-gray-500/5 rounded-lg hover:bg-gray-500/10 transition-colors"
            >
              <div className="text-gray-700 font-medium">QSE</div>
              <div className="text-sm text-gray-500/70">Corporate docs</div>
            </Link>

            <Link
              href="/portal/projects"
              className="p-4 bg-gray-500/5 rounded-lg hover:bg-gray-500/10 transition-colors"
            >
              <div className="text-gray-700 font-medium">Client Portal</div>
              <div className="text-sm text-gray-500/70">Client access</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}