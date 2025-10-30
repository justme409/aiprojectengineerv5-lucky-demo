import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type IndexGroup = {
  title: string
  items: { label: string; href: string }[]
}

const qseIndex: IndexGroup[] = [
  {
    title: "Corporate Tier 1",
    items: [
      { label: "Corporate QSE Management System", href: "/qse/corporate-tier-1" },
    ],
  },
  {
    title: "Context",
    items: [
      { label: "Context of the Organization", href: "/qse/corp-context" },
      { label: "Compliance Obligations", href: "/qse/corp-legal" },
    ],
  },
  {
    title: "Leadership",
    items: [
      { label: "Leadership Overview", href: "/qse/corp-leadership" },
      { label: "Policy, Roles & Responsibilities", href: "/qse/corp-policy-roles" },
      { label: "Worker Consultation & Participation", href: "/qse/corp-consultation" },
      { label: "Communication", href: "/qse/corp-communication" },
    ],
  },
  {
    title: "Planning",
    items: [
      { label: "Planning Overview", href: "/qse/corp-planning" },
      { label: "Risk & Opportunity Management", href: "/qse/corp-risk-management" },
      { label: "QSE Objectives", href: "/qse/corp-objectives" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Support Overview", href: "/qse/corp-support" },
      { label: "Resources, Competence & Awareness", href: "/qse/corp-competence" },
      { label: "Documented Information", href: "/qse/corp-documentation" },
    ],
  },
  {
    title: "Operation",
    items: [
      { label: "Operation Overview", href: "/qse/corp-operation" },
      { label: "Operational Procedures & Templates", href: "/qse/corp-op-procedures-templates" },
    ],
  },
  {
    title: "Performance Evaluation",
    items: [
      { label: "Performance Overview", href: "/qse/corp-performance" },
      { label: "Monitoring, Measurement & Evaluation", href: "/qse/corp-monitoring" },
      { label: "Internal Audit", href: "/qse/corp-audit" },
      { label: "Management Review", href: "/qse/corp-review" },
    ],
  },
  {
    title: "Improvement",
    items: [
      { label: "Improvement Overview", href: "/qse/corp-improvement" },
      { label: "Nonconformity & Corrective Action", href: "/qse/corp-ncr" },
      { label: "Continual Improvement", href: "/qse/corp-continual-improvement" },
    ],
  },
]

export default async function QSEPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">QSE</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold mb-1">QSE Management System</h1>
        <p className="text-sm text-muted-foreground">
          Explore the corporate Quality, Safety and Environmental (QSE) management system. Use the index below to access
          policies, procedures, templates and governance across all QSE domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <Link className="text-primary hover:underline" href="/qse/corporate-tier-1">
                  Corporate QSE Management System
                </Link>
              </li>
              <li>
                <Link className="text-primary hover:underline" href="/qse/corp-op-procedures-templates">
                  Operational Procedures & Templates
                </Link>
              </li>
              <li>
                <Link className="text-primary hover:underline" href="/qse/corp-audit">
                  Internal Audit
                </Link>
              </li>
              <li>
                <Link className="text-primary hover:underline" href="/qse/corp-ncr">
                  Nonconformity & Corrective Action
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About This Space</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Centralized corporate QSE content, aligned to ISO management system structure. This index groups content by
            domain for clarity and quick navigation.
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {qseIndex.map((group) => (
          <Card key={group.title} className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link className="text-primary hover:underline" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
