"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react"
// Icons removed from QSE sidebar

const qseGroups = [
  {
    id: 'overview',
    title: 'QSE Overview',
    path: '/qse',
    isGroup: false,
    active: true
  },
  {
    id: 'corporate-tier-1',
    title: 'Corporate Tier 1',
    path: '/qse/corporate-tier-1',
    isGroup: false,
    active: true
  },
  {
    id: 'context',
    title: 'Context of Organization',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-context',
        title: 'Context of Organization',
        path: '/qse/corp-context',
        active: true
      },
      {
        id: 'corp-legal',
        title: 'Legal & Compliance',
        path: '/qse/corp-legal',
        active: true
      }
    ]
  },
  {
    id: 'leadership',
    title: 'Leadership',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-leadership',
        title: 'Leadership & Commitment',
        path: '/qse/corp-leadership',
        active: true
      },
      {
        id: 'corp-policy-roles',
        title: 'Policy & Roles',
        path: '/qse/corp-policy-roles',
        active: true
      },
      {
        id: 'corp-communication',
        title: 'Communication',
        path: '/qse/corp-communication',
        active: true
      },
      {
        id: 'corp-consultation',
        title: 'Worker Consultation',
        path: '/qse/corp-consultation',
        active: true
      }
    ]
  },
  {
    id: 'planning',
    title: 'Planning',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-planning',
        title: 'Planning Overview',
        path: '/qse/corp-planning',
        active: true
      },
      {
        id: 'corp-risk-management',
        title: 'Risk Management',
        path: '/qse/corp-risk-management',
        active: true
      },
      {
        id: 'corp-objectives',
        title: 'QSE Objectives',
        path: '/qse/corp-objectives',
        active: true
      }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-support',
        title: 'Support Overview',
        path: '/qse/corp-support',
        active: true
      },
      {
        id: 'corp-competence',
        title: 'Competence Management',
        path: '/qse/corp-competence',
        active: true
      },
      {
        id: 'corp-documentation',
        title: 'Documentation Control',
        path: '/qse/corp-documentation',
        active: true
      }
    ]
  },
  {
    id: 'operation',
    title: 'Operation',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-operation',
        title: 'Operation Overview',
        path: '/qse/corp-operation',
        active: true
      },
      {
        id: 'corp-op-procedures-templates',
        title: 'Operational Procedures',
        path: '/qse/corp-op-procedures-templates',
        active: true
      }
    ]
  },
  {
    id: 'performance',
    title: 'Performance Evaluation',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-performance',
        title: 'Performance Overview',
        path: '/qse/corp-performance',
        active: true
      },
      {
        id: 'corp-monitoring',
        title: 'Monitoring & Measurement',
        path: '/qse/corp-monitoring',
        active: true
      }
    ]
  },
  {
    id: 'improvement',
    title: 'Improvement',
    isGroup: true,
    expanded: false,
    items: [
      {
        id: 'corp-improvement',
        title: 'Improvement Overview',
        path: '/qse/corp-improvement',
        active: true
      },
      {
        id: 'corp-audit',
        title: 'Internal Audit',
        path: '/qse/corp-audit',
        active: true
      },
      {
        id: 'corp-review',
        title: 'Management Review',
        path: '/qse/corp-review',
        active: true
      },
      {
        id: 'corp-continual-improvement',
        title: 'Continual Improvement',
        path: '/qse/corp-continual-improvement',
        active: true
      },
      {
        id: 'corp-ncr',
        title: 'Non-Conformance Reports',
        path: '/qse/corp-ncr',
        active: true
      }
    ]
  }
]

interface QseSidebarProps {
  className?: string
  onCollapseChange?: (collapsed: boolean) => void
}

export function QseSidebar({ className, onCollapseChange }: QseSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    'context': false,
    'leadership': false,
    'planning': false,
    'support': false,
    'operation': false,
    'performance': false,
    'improvement': false,
  })

  // Update sidebar width CSS variable
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const width = collapsed ? '64px' : '256px'
      document.documentElement.style.setProperty('--qse-sidebar-width', width)
    }
  }, [collapsed])

  const isActive = (path: string) => {
    if (path === '/qse') {
      return pathname === '/qse'
    }
    return pathname?.startsWith(path)
  }

  const isGroupActive = (group: any) => {
    if (!group.isGroup) return isActive(group.path)
    return group.items?.some((item: any) => isActive(item.path)) || false
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
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
            <Link href="/qse" className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              QSE
            </Link>
          </div>
          <button
            onClick={() => {
              setCollapsed(true)
              onCollapseChange?.(true)
            }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-slate-100 transition-all duration-200 ease-in-out"
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-3 border-b border-gray-200 transition-all duration-300 ease-in-out">
          <button
            onClick={() => {
              setCollapsed(false)
              onCollapseChange?.(false)
            }}
            className="h-7 w-7 grid place-items-center rounded hover:bg-slate-100 transition-all duration-200 ease-in-out"
            aria-label="Expand sidebar"
            title="Expand"
          >
            <ChevronRight className="h-4 w-4 text-slate-700 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      )}

      {/* Modules List */}
      <div className="flex-1 p-2 transition-all duration-300 ease-in-out">
        <div className="space-y-1">
          {qseGroups.map((group) => {
            const groupActive = isGroupActive(group)

            if (!group.isGroup) {
              // Single item (not a group)
              const active = group.path ? isActive(group.path) : false
              return (
                <div key={group.id}>
                  {!collapsed ? (
                    <Link
                      href={group.path || '#'}
                      className={cn(
                        "flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-all duration-200",
                        active ? "bg-accent border-r-2 border-primary" : "",
                        !group.active ? "opacity-60" : ""
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "text-sm font-medium truncate block text-gray-700"
                        )}>
                          {group.title}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <Link href={group.path || '#'}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full h-12 hover:bg-gray-100 mb-1 justify-start px-3",
                          active ? "bg-accent" : "",
                          !group.active ? "opacity-60" : ""
                        )}
                        title={group.title}
                        disabled={!group.active}
                      >
                        <span className="text-xs font-medium truncate">
                          {group.title.length > 8 ? group.title.substring(0, 8) + '...' : group.title}
                        </span>
                      </Button>
                    </Link>
                  )}
                </div>
              )
            } else {
              // Group with expandable items
              return (
                <div key={group.id}>
                  {!collapsed ? (
                    <>
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className={cn(
                          "flex items-center justify-between p-3 w-full text-left hover:bg-gray-100 cursor-pointer rounded-lg transition-all duration-200",
                          groupActive ? "bg-accent border-r-2 border-primary" : ""
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "text-sm font-medium truncate block text-gray-700"
                          )}>
                            {group.title}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedGroups[group.id] ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      </button>

                      {/* Group Items */}
                      {expandedGroups[group.id] && (
                        <div className="ml-6 space-y-1 mt-1">
                          {group.items?.map((item: any) => {
                            const active = isActive(item.path)
                            return (
                              <Link
                                key={item.id}
                                href={item.path || '#'}
                                className={cn(
                                  "flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded transition-all duration-200",
                                  active ? "bg-accent border-r-2 border-primary" : "",
                                  !item.active ? "opacity-60" : ""
                                )}
                              >
                                <div className="flex-1 min-w-0">
                                  <span className={cn(
                                    "text-sm font-medium truncate block text-gray-700"
                                  )}>
                                    {item.title}
                                  </span>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Collapsed Group */}
                      <Button
                        variant="ghost"
                        onClick={() => toggleGroup(group.id)}
                        className={cn(
                          "w-full h-12 hover:bg-gray-100 mb-1 justify-start px-3",
                          groupActive ? "bg-accent" : ""
                        )}
                        title={group.title}
                      >
                        <span className="text-xs font-medium truncate">
                          {group.title.length > 8 ? group.title.substring(0, 8) + '...' : group.title}
                        </span>
                      </Button>

                      {/* Collapsed Group Items */}
                      {expandedGroups[group.id] && (
                        <div className="ml-2 space-y-1">
                          {group.items?.map((item: any) => {
                            const active = isActive(item.path)
                            return (
                              <Button
                                key={item.id}
                                variant="ghost"
                                asChild
                                className={cn(
                                  "w-full h-8 hover:bg-gray-100 justify-start px-2",
                                  active ? "bg-accent" : "",
                                  !item.active ? "opacity-60" : ""
                                )}
                                title={item.title}
                                disabled={!item.active}
                              >
                                <Link href={item.path || '#'}>
                                  <span className="text-xs font-medium truncate">
                                    {item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title}
                                  </span>
                                </Link>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}
