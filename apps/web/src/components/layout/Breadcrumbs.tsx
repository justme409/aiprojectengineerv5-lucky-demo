"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)

    // Always start with Dashboard
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ]

    if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
      breadcrumbs[0].isActive = true
      return breadcrumbs
    }

    // Handle different routes
    switch (pathSegments[0]) {
      case 'portal': {
        // /portal/projects/:projectId/... (client portal)
        breadcrumbs.push({ label: 'Client Portal', href: '/portal' })
        if (pathSegments[1] === 'projects' && pathSegments[2]) {
          const projectId = pathSegments[2]
          // Portal project dashboard as root
          breadcrumbs.push({ label: 'Projects', href: '/portal/projects' })
          breadcrumbs.push({ label: 'Overview', href: `/portal/projects/${projectId}/dashboard`, isActive: !pathSegments[3] })

          if (pathSegments[3]) {
            // Handle nested quality ITP routes
            if (pathSegments[3] === 'quality' && pathSegments[4] === 'itps') {
              const leaf = pathSegments[5];
              const segment = pathSegments[6];
              const baseHref = `/portal/projects/${projectId}/quality/itps`;
              breadcrumbs[breadcrumbs.length - 1].isActive = false;

              if (leaf === 'templates') {
                const templatesHref = `${baseHref}/templates`;
                const isDetail = Boolean(segment);
                breadcrumbs.push({ label: 'ITP Templates', href: templatesHref, isActive: !isDetail });
                if (isDetail) {
                  breadcrumbs[breadcrumbs.length - 1].isActive = false;
                  breadcrumbs.push({ label: 'Template Details', href: pathname, isActive: true });
                }
              } else if (leaf === 'instances') {
                const instancesHref = `${baseHref}/instances`;
                const isDetail = Boolean(segment);
                breadcrumbs.push({ label: 'ITP Instances', href: instancesHref, isActive: !isDetail });
                if (isDetail) {
                  breadcrumbs[breadcrumbs.length - 1].isActive = false;
                  breadcrumbs.push({ label: 'Instance Details', href: pathname, isActive: true });
                }
              } else {
                breadcrumbs.push({ label: 'Quality', href: `${baseHref}`, isActive: true });
              }
            } else {
              const sub = pathSegments.slice(3).join('/')
              const map: Record<string, string> = {
                'documents': 'Documents',
                'pending-approvals': 'Pending Approvals',
                'management-plans': 'Management Plans',
                'wbs': 'WBS',
                'lots': 'Lots',
                'details': 'Details'
              }
              const label = map[pathSegments[3]] || pathSegments[3]
              breadcrumbs[breadcrumbs.length - 1].isActive = false
              breadcrumbs.push({ label, href: `/portal/projects/${projectId}/${sub}`, isActive: true })
            }
          }
        } else {
          breadcrumbs[breadcrumbs.length - 1].isActive = true
        }
        break
      }
      case 'projects':
        breadcrumbs.push({ label: 'Projects', href: '/projects' })

        if (pathSegments[1] === 'new') {
          breadcrumbs.push({ label: 'New Project', href: '/projects/new', isActive: true })
        } else if (pathSegments[1]) {
          // Handle project-specific routes
          const projectId = pathSegments[1]
          const subRoute = pathSegments[2] || 'overview' // Default to overview if no sub-route

          // Always add Overview as the project-level breadcrumb
          const isOnOverview = !pathSegments[2] || pathSegments[2] === 'overview'
          breadcrumbs.push({
            label: 'Overview',
            href: `/projects/${projectId}/overview`,
            isActive: isOnOverview
          })

          // Add specific sub-route if we're not on overview
          if (pathSegments[2] && pathSegments[2] !== 'overview') {
            if (pathSegments[2] === 'quality' && pathSegments[3] === 'itps') {
              breadcrumbs[breadcrumbs.length - 1].isActive = false

              const resource = pathSegments[4]
              const detailId = pathSegments[5]

              if (resource === 'templates') {
                const templatesHref = `/projects/${projectId}/quality/itps/templates`
                const isDetail = Boolean(detailId)
                breadcrumbs.push({ label: 'ITP Templates', href: templatesHref, isActive: !isDetail })

                if (isDetail) {
                  breadcrumbs[breadcrumbs.length - 1].isActive = false
                  breadcrumbs.push({ label: 'Template Details', href: pathname, isActive: true })
                }
              } else if (resource === 'instances') {
                const instancesHref = `/projects/${projectId}/quality/itps/instances`
                const isDetail = Boolean(detailId)
                breadcrumbs.push({ label: 'ITP Instances', href: instancesHref, isActive: !isDetail })

                if (isDetail) {
                  breadcrumbs[breadcrumbs.length - 1].isActive = false
                  breadcrumbs.push({ label: 'Instance Details', href: pathname, isActive: true })
                }
              } else {
                breadcrumbs.push({ label: 'Quality', href: `/projects/${projectId}/quality`, isActive: true })
              }
            } else if (pathSegments[2] === 'quality' && pathSegments[3] === 'lot-register') {
              breadcrumbs[breadcrumbs.length - 1].isActive = false
              breadcrumbs.push({ label: 'Lot Register', href: `/projects/${projectId}/quality/lot-register`, isActive: true })
            } else {
              const subRoutes: Record<string, string> = {
                'documents': 'Documents',
                'plans': 'Project Plans',
                'settings': 'Settings',
                'edit': 'Edit'
              }
              const subRouteLabel = subRoutes[pathSegments[2]] || pathSegments[2]
              breadcrumbs.push({
                label: subRouteLabel,
                href: pathname,
                isActive: true
              })
            }
          }
        } else {
          breadcrumbs[1].isActive = true
        }
        break

      case 'account':
        breadcrumbs.push({ label: 'Account', href: '/account', isActive: true })
        break

      case 'qse':
        breadcrumbs.push({ label: 'QSE', href: '/qse', isActive: true })
        break

      default:
        // Handle any other routes
        const currentSegment = pathSegments[pathSegments.length - 1]
        breadcrumbs.push({
          label: currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1),
          href: pathname,
          isActive: true
        })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on dashboard (only one item)
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 px-4 py-2 border-b text-sm">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            {crumb.isActive ? (
              <span className="text-foreground font-medium">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
