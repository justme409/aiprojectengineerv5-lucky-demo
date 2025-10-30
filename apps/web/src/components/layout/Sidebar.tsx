"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FolderOpen, FileText, Map, Mail, Settings } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

interface Project {
  id: string
  name: string
  description?: string
  location?: string
  client_name?: string
  created_at: string
  organization_name: string
  projectAsset?: {
    name?: string
    content?: {
      client?: string
      client_name?: string
      project_address?: string
      location?: string
    }
  }
  displayName?: string
  displayClient?: string
}

interface SidebarProps {
  className?: string
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ className, onCollapseChange }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [expandedSectionsByProject, setExpandedSectionsByProject] = useState<Record<string, Record<string, boolean>>>({})

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/v1/projects?enriched=true')
        if (response.ok) {
          const data = await response.json()
          // Ensure projects are sorted by created date (newest first)
          const sortedProjects = (data.projects || []).sort((a: Project, b: Project) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setProjects(sortedProjects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  // Update sidebar width CSS variable
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const width = collapsed ? '64px' : '256px'
      document.documentElement.style.setProperty('--sidebar-width', width)
    }
  }, [collapsed])

  // Generate 3-letter abbreviation for project name
  const getProjectAbbrev = (displayName: string): string => {
    if (!displayName) return 'UNK'
    const words = displayName.split(/\s+/)
    if (words.length >= 3) {
      return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('')
    } else if (words.length === 2) {
      const first = words[0].charAt(0).toUpperCase()
      const second = words[1].slice(0, 2).toUpperCase()
      return (first + second).slice(0, 3)
    } else {
      return displayName.slice(0, 3).toUpperCase()
    }
  }

  // Ensure unique abbreviations
  const getUniqueAbbrev = (displayName: string, allProjects: Project[]): string => {
    const baseAbbrev = getProjectAbbrev(displayName)
    let abbrev = baseAbbrev
    let counter = 1

    while (allProjects.some(p => p.id !== params.projectId && getProjectAbbrev(p.displayName || p.name) === abbrev)) {
      if (counter === 1) {
        abbrev = baseAbbrev.slice(0, 2) + counter.toString()
      } else {
        abbrev = baseAbbrev.slice(0, 2) + counter.toString()
      }
      counter++
      if (counter > 9) break // Prevent infinite loop
    }

    return abbrev
  }

  const isActive = (projectId: string) => {
    return pathname?.includes(`/projects/${projectId}`)
  }

  type SectionLink = { label: string; href: string; icon?: React.ComponentType<any> }
  type Section = { id: string; title: string; links: SectionLink[] }

  const getSectionsForProject = (projectId: string, jurisdiction?: string): Section[] => {
    const showPrimaryTesting = (jurisdiction || '').toUpperCase() === 'NSW'
    const sections: Section[] = [
      {
        id: 'project-controls',
        title: 'Project Controls',
        links: [
          { label: 'Management Plans', href: `/projects/${projectId}/plans`, icon: FileText },
          { label: 'Schedule & WBS', href: `/projects/${projectId}/wbs`, icon: FileText },
        ],
      },
      {
        id: 'documents',
        title: 'Documents',
        links: [
          { label: 'Documents', href: `/projects/${projectId}/documents`, icon: FileText },
        ],
      },
      {
        id: 'quality',
        title: 'Quality',
        links: [
          { label: 'ITP Templates Register', href: `/projects/${projectId}/quality/itp-templates-register`, icon: FileText },
          { label: 'Lot Register', href: `/projects/${projectId}/quality/lot-register`, icon: FileText },
          { label: 'Inspections', href: `/projects/${projectId}/inspections`, icon: FileText },
          { label: 'Materials', href: `/projects/${projectId}/materials`, icon: FileText },
          // { label: 'Tests', href: `/projects/${projectId}/tests`, icon: FileText },
          ...(showPrimaryTesting ? [{ label: 'Primary Testing (NSW)', href: `/projects/${projectId}/quality/primary-testing`, icon: FileText } as SectionLink] : []),
        ],
      },
      {
        id: 'hse',
        title: 'Health, Safety & Environment',
        links: [
          { label: 'SWMS', href: `/projects/${projectId}/hse/swms`, icon: FileText },
          { label: 'Permits', href: `/projects/${projectId}/hse/permits`, icon: FileText },
          { label: 'Toolbox Talks', href: `/projects/${projectId}/hse/toolbox-talks`, icon: FileText },
          { label: 'Safety Walks', href: `/projects/${projectId}/hse/safety-walks`, icon: FileText },
          { label: 'Inductions', href: `/projects/${projectId}/hse/inductions`, icon: FileText },
          { label: 'Incidents', href: `/projects/${projectId}/hse/incidents`, icon: FileText },
        ],
      },
      {
        id: 'site',
        title: 'Site',
        links: [
          { label: 'Daily Diaries', href: `/projects/${projectId}/field/daily-diaries`, icon: FileText },
          { label: 'Site Instructions', href: `/projects/${projectId}/field/site-instructions`, icon: FileText },
          { label: 'Photos', href: `/projects/${projectId}/field/photos`, icon: FileText },
        ],
      },
      {
        id: 'approvals',
        title: 'Approvals & Communication',
        links: [
          { label: 'Approvals Designer', href: `/projects/${projectId}/approvals/designer`, icon: FileText },
          { label: 'Approvals Inbox', href: `/projects/${projectId}/approvals/inbox`, icon: Mail },
          { label: 'Project Inbox', href: `/projects/${projectId}/inbox`, icon: Mail },
        ],
      },
      {
        id: 'tools',
        title: 'Tools & Analytics',
        links: [
          { label: 'Map View', href: `/projects/${projectId}/map`, icon: Map },
          { label: 'Reports', href: `/projects/${projectId}/reports`, icon: FileText },
          { label: 'Settings', href: `/projects/${projectId}/settings`, icon: Settings },
        ],
      },
    ]

    return sections
  }

  const isSectionExpanded = (projectId: string, sectionId: string) => {
    return !!expandedSectionsByProject[projectId]?.[sectionId]
  }

  const toggleSection = (projectId: string, sectionId: string) => {
    setExpandedSectionsByProject(prev => {
      const projectSections = prev[projectId] || {}
      return {
        ...prev,
        [projectId]: {
          ...projectSections,
          [sectionId]: !projectSections[sectionId]
        }
      }
    })
  }

  if (loading) {
    return (
      <div
        className={cn("bg-white border-r border-gray-200 h-full flex flex-col", className)}
        style={{ width: collapsed ? 64 : 256 }}
      >
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("bg-white border-r border-gray-200 h-full overflow-y-auto relative flex flex-col transition-all duration-300 ease-in-out", className)}
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Header */}
      {!collapsed ? (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 transition-all duration-300 ease-in-out">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Projects</h2>
          </div>
          <button
            onClick={() => {
              setCollapsed(true)
              onCollapseChange?.(true)
            }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-gray-100 transition-all duration-200 ease-in-out"
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-3 border-b border-gray-200 transition-all duration-300 ease-in-out">
          <button
            onClick={() => {
              setCollapsed(false)
              onCollapseChange?.(false)
            }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-gray-100 transition-all duration-200 ease-in-out"
            aria-label="Expand sidebar"
            title="Expand"
          >
            <ChevronRight className="h-4 w-4 text-gray-700 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 p-2 transition-all duration-300 ease-in-out">
          <div className="space-y-1">
          {projects.length === 0 ? (
            <div className="px-2 py-3 text-xs text-gray-500 text-center">
              {collapsed ? 'No projects' : 'No projects found'}
            </div>
          ) : (
            projects.map((project) => {
              const displayName = project.displayName || project.name || `Project ${project.id.slice(0, 8)}`
              const abbrev = getUniqueAbbrev(displayName, projects)
              const active = isActive(project.id)
              const jurisdiction = (project.projectAsset as any)?.content?.jurisdiction as string | undefined
              const isExpanded = expandedProjectId === project.id

              return (
                <div key={project.id}>
                  {!collapsed ? (
                    <div
                      className={cn(
                        "p-1 rounded",
                        active ? "bg-accent border-r-2 border-primary" : ""
                      )}
                    >
                      <div className="flex items-center">
                        <Link
                          href={`/projects/${project.id}/overview`}
                          title={displayName}
                          className={cn(
                            "flex items-center gap-2 flex-1 min-w-0 p-1 hover:bg-gray-100 rounded",
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-xs font-medium text-gray-700 flex-shrink-0">
                              <FolderOpen className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium truncate text-gray-700">
                              {displayName}
                            </span>
                          </div>
                        </Link>
                        <button
                          className="h-7 w-7 grid place-items-center rounded hover:bg-gray-100"
                          aria-label={isExpanded ? "Collapse project" : "Expand project"}
                          title={isExpanded ? "Collapse" : "Expand"}
                          onClick={() => setExpandedProjectId(prev => prev === project.id ? null : project.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-700" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-700" />
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-1 pl-2">
                          {getSectionsForProject(project.id, jurisdiction).map(section => {
                            const sectionOpen = isSectionExpanded(project.id, section.id)
                            return (
                              <div key={section.id} className="mb-1">
                                <button
                                  className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                                  onClick={() => toggleSection(project.id, section.id)}
                                  aria-expanded={sectionOpen}
                                >
                                  <span className="truncate">{section.title}</span>
                                  {sectionOpen ? (
                                    <ChevronUp className="h-3 w-3 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-gray-600" />
                                  )}
                                </button>
                                {sectionOpen && (
                                  <div className="mt-1 space-y-0.5">
                                    {section.links.map(link => {
                                      const selected = pathname?.startsWith(link.href)
                                      const Icon = link.icon
                                      return (
                                        <Link key={link.href} href={link.href}>
                                          <Button
                                            variant="ghost"
                                            className={cn(
                                              "w-full justify-start h-8 text-xs px-2",
                                              selected ? "bg-gray-100" : ""
                                            )}
                                          >
                                            {Icon ? <Icon className="mr-2 h-3 w-3" /> : null}
                                            {link.label}
                                          </Button>
                                        </Link>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={`/projects/${project.id}/overview`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-full h-9 hover:bg-gray-100",
                          active ? "bg-accent" : ""
                        )}
                        title={displayName}
                      >
                        <span className="text-xs font-semibold text-gray-700">
                          {abbrev}
                        </span>
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })
                )}
        </div>
      </div>

    </div>
  )
}
