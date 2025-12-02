'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, FileDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDateValue, PlanSectionWithChildren } from '@/lib/management-plans/plan-utils';
import type { ManagementPlanNode } from '@/schemas/neo4j';
import { PlanSectionEditor } from './plan-section-editor';

// Status badge styling
const STATUS_BADGE_VARIANTS: Record<
  ManagementPlanNode['approvalStatus'],
  { label: string; className: string }
> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  in_review: { label: 'In Review', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  superseded: { label: 'Superseded', className: 'bg-rose-100 text-rose-700 border-rose-200' },
};

function ApprovalStatusBadge({ status }: { status?: ManagementPlanNode['approvalStatus'] | string | null }) {
  if (!status) return null;
  
  const normalized = status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_') as ManagementPlanNode['approvalStatus'];
  
  const item = STATUS_BADGE_VARIANTS[normalized];
  if (!item) return <Badge variant="outline">{status}</Badge>;
  
  return <Badge variant="outline" className={item.className}>{item.label}</Badge>;
}

/**
 * Strip the first heading from HTML body if it matches the section heading
 * This prevents duplicate headings when the agent includes the heading in the body
 */
function stripDuplicateHeading(html: string, sectionHeading?: string, headingNumber?: string): string {
  if (!html || !sectionHeading) return html;
  
  // Build patterns to match the first h2 that contains the section heading
  // Matches: <h2>1. Introduction</h2> or <h2>1 Introduction</h2> or just <h2>Introduction</h2>
  const escapedHeading = sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const numberPattern = headingNumber ? `(?:${headingNumber}\\.?\\s*)?` : '';
  
  // Match first h2 tag that starts with optional number + heading text
  const pattern = new RegExp(
    `^\\s*<h2[^>]*>\\s*${numberPattern}${escapedHeading}\\s*</h2>\\s*`,
    'i'
  );
  
  return html.replace(pattern, '');
}

function HtmlContent({ html, className }: { html?: string | null; className?: string }) {
  if (!html || typeof html !== 'string' || html.trim() === '') {
    return null;
  }

  const cleanedHtml = html
    .replace(/\\n/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  return (
    <div
      className={cn(
        // Base prose styling
        'prose prose-slate dark:prose-invert max-w-none',
        // Better paragraph spacing
        'prose-p:my-4 prose-p:leading-7',
        // Heading hierarchy - subsections (h3) are smaller than body text emphasis
        'prose-h2:hidden', // h2 in body is hidden since we render section heading separately
        'prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-foreground',
        'prose-h4:text-sm prose-h4:font-medium prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-muted-foreground',
        // Lists with proper spacing
        'prose-ul:my-4 prose-ul:pl-6',
        'prose-ol:my-4 prose-ol:pl-6',
        'prose-li:my-2 prose-li:leading-7',
        // Strong text
        'prose-strong:font-semibold prose-strong:text-foreground',
        // Links
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        // Table styling - professional document look
        '[&_table]:w-full [&_table]:my-6 [&_table]:text-sm',
        '[&_table]:border-collapse [&_table]:border [&_table]:border-border',
        '[&_thead]:bg-muted',
        '[&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground',
        '[&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-3 [&_td]:text-foreground [&_td]:align-top',
        '[&_tbody_tr:nth-child(even)]:bg-muted/30',
        '[&_tbody_tr:hover]:bg-muted/50',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: cleanedHtml }}
    />
  );
}

function renderSectionContent(sections: PlanSectionWithChildren[]): JSX.Element | null {
  if (!sections.length) return null;

  return (
    <div className="divide-y divide-border/30">
      {sections.map((section, index) => {
        // Strip duplicate heading from body if it exists
        const cleanedBody = stripDuplicateHeading(
          section.body || '',
          section.heading,
          section.headingNumber
        );

        return (
          <section 
            key={section.id} 
            className={cn(
              'py-8',
              index === 0 && 'pt-0', // No top padding on first section
            )}
          >
            {/* Section heading - only show if we have heading info */}
            {(section.headingNumber || section.heading) && (
<h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/40 uppercase tracking-wide">
                 {section.headingNumber ? `${section.headingNumber}. ` : ''}
                 {section.heading || ''}
               </h2>
            )}
            
            {/* Section body */}
            {cleanedBody?.trim() ? (
              <HtmlContent html={cleanedBody} />
            ) : (
              <p className="text-muted-foreground italic py-4">
                No content for this section.
              </p>
            )}
            
            {/* Nested sections */}
            {section.children.length > 0 && (
              <div className="mt-6 pl-4 border-l-2 border-border/40">
                {renderSectionContent(section.children)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export interface PlanDocumentViewProps {
  projectId: string;
  plan: ManagementPlanNode;
  sections: PlanSectionWithChildren[];
  planTypeSlug: 'pqp' | 'emp' | 'ohsmp' | 'tmp' | 'cemp';
}

export function PlanDocumentView({
  projectId,
  plan,
  sections,
  planTypeSlug,
}: PlanDocumentViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Derive a display title - use plan.title if it exists, otherwise fallback to type
  const displayTitle = plan.title || `${plan.type.replace('_', ' ')} Plan`;

  const handleSaved = () => {
    // Refresh the page to show updated content
    router.refresh();
  };

  if (isEditing) {
    return (
      <PlanSectionEditor
        projectId={projectId}
        planType={planTypeSlug}
        planId={plan.id || plan.type}
        sections={sections}
        planTitle={displayTitle}
        planVersion={plan.version || '1.0'}
        onClose={() => setIsEditing(false)}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex items-start justify-between pb-6 border-b border-border">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <ApprovalStatusBadge status={plan.approvalStatus} />
            {plan.version && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Version</span> {plan.version}
              </span>
            )}
            {plan.updatedAt && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Updated</span> {formatDateValue(plan.updatedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/api/v1/projects/${encodeURIComponent(projectId)}/plans/${encodeURIComponent(planTypeSlug)}/export`}
              title="Export as DOCX"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </a>
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <Card className="shadow-sm">
        <CardContent className="py-10 px-8 lg:px-16">
          {sections.length > 0 ? (
            <article className="max-w-4xl mx-auto">
              {renderSectionContent(sections)}
            </article>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No content has been generated for this plan yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Back link */}
      <div className="pt-4">
        <Link
          href={`/projects/${projectId}/management-plans`}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Back to Management Plans
        </Link>
      </div>
    </div>
  );
}
