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
    title: "Context of Organization",
    items: [
      { label: "Context of Organization", href: "/qse/corp-context" },
      { label: "Legal & Compliance", href: "/qse/corp-legal" },
    ],
  },
  {
    title: "Leadership",
    items: [
      { label: "Leadership & Commitment", href: "/qse/corp-leadership" },
      { label: "Policy & Roles", href: "/qse/corp-policy-roles" },
      { label: "Communication", href: "/qse/corp-communication" },
      { label: "Worker Consultation", href: "/qse/corp-consultation" },
    ],
  },
  {
    title: "Planning",
    items: [
      { label: "Planning Overview", href: "/qse/corp-planning" },
      { label: "Risk Management", href: "/qse/corp-risk-management" },
      { label: "QSE Objectives", href: "/qse/corp-objectives" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Support Overview", href: "/qse/corp-support" },
      { label: "Competence Management", href: "/qse/corp-competence" },
      { label: "Documentation Control", href: "/qse/corp-documentation" },
    ],
  },
  {
    title: "Operation",
    items: [
      { label: "Operation Overview", href: "/qse/corp-operation" },
      { label: "Operational Procedures", href: "/qse/corp-op-procedures-templates" },
    ],
  },
  {
    title: "Performance Evaluation",
    items: [
      { label: "Performance Overview", href: "/qse/corp-performance" },
      { label: "Monitoring & Measurement", href: "/qse/corp-monitoring" },
    ],
  },
  {
    title: "Improvement",
    items: [
      { label: "Improvement Overview", href: "/qse/corp-improvement" },
      { label: "Internal Audit", href: "/qse/corp-audit" },
      { label: "Management Review", href: "/qse/corp-review" },
      { label: "Continual Improvement", href: "/qse/corp-continual-improvement" },
      { label: "Non-Conformance Reports", href: "/qse/corp-ncr" },
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


