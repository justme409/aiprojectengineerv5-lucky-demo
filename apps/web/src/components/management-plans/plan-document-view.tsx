'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, FileDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateValue, PlanSectionWithChildren } from '@/lib/management-plans/plan-utils';
import type { ManagementPlanNode } from '@/schemas/neo4j';
import { PlanSectionEditor } from './plan-section-editor';
import { IMSLinkRenderer, parseIMSLinks, type IMSLink } from './IMSLinkRenderer';

/**
 * Extract IMS references from section body text (e.g., "QSE-10.2-PROC-01")
 * and convert them to clickable links
 */
function extractIMSReferencesFromBody(body: string | null | undefined): IMSLink[] {
  if (!body) return [];
  
  // Pattern to match QSE document IDs like QSE-10.2-PROC-01, QSE-8.1-FORM-05, etc.
  const qsePattern = /QSE-[\d.]+-(PROC|FORM|REG|TEMP|POL|PLAN)-\d+/gi;
  const matches = body.match(qsePattern);
  
  if (!matches) return [];
  
  // Deduplicate
  const unique = [...new Set(matches.map(m => m.toUpperCase()))];
  
  return unique.map(imsId => ({
    label: imsId,
    imsId: imsId,
    path: `/qse/${imsId.toLowerCase()}`,
  }));
}

/**
 * Parse imsReferences array (legacy format) to IMSLink array
 */
function parseIMSReferencesArray(refs: string[] | null | undefined): IMSLink[] {
  if (!refs || !Array.isArray(refs)) return [];
  
  return refs.map(imsId => ({
    label: imsId,
    imsId: imsId,
    path: `/qse/${imsId.toLowerCase()}`,
  }));
}

/**
 * Get all IMS links from various sources on a section
 */
function getAllIMSLinks(section: any): IMSLink[] {
  const links: IMSLink[] = [];
  
  // 1. From imsLinksJson (new format)
  const jsonLinks = parseIMSLinks(section.imsLinksJson);
  links.push(...jsonLinks);
  
  // 2. From imsReferences array (legacy format)
  const arrayLinks = parseIMSReferencesArray(section.imsReferences);
  links.push(...arrayLinks);
  
  // 3. Extract from body text
  const bodyLinks = extractIMSReferencesFromBody(section.body);
  links.push(...bodyLinks);
  
  // Deduplicate by imsId
  const seen = new Set<string>();
  return links.filter(link => {
    const key = link.imsId.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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
        // Base text styling
        'text-foreground text-[15px] leading-relaxed',
        // Paragraph spacing - tighter
        '[&_p]:mb-3 [&_p]:mt-0',
        '[&_p:last-child]:mb-0',
        // Hide duplicate h2s from body
        '[&_h2]:hidden',
        // Subsection headings (h3) - smaller than main section headings
        '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3',
        '[&_h4]:text-base [&_h4]:font-medium [&_h4]:text-foreground [&_h4]:mt-5 [&_h4]:mb-2',
        // Lists
        '[&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc',
        '[&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal',
        '[&_li]:mb-1.5 [&_li]:leading-relaxed',
        // Strong/bold
        '[&_strong]:font-semibold',
        // Links
        '[&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80',
        // Tables
        '[&_table]:w-full [&_table]:my-4 [&_table]:text-sm',
        '[&_table]:border-collapse [&_table]:border [&_table]:border-border',
        '[&_thead]:bg-muted/50',
        '[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: cleanedHtml }}
    />
  );
}

/**
 * Determine heading level based on section depth
 */
function getSectionHeadingNumber(headingNumber?: string): number {
  if (!headingNumber) return 1;
  const parts = headingNumber.split('.');
  return parts.length;
}

interface SectionRendererProps {
  sections: PlanSectionWithChildren[];
  depth?: number;
}

function SectionRenderer({ sections, depth = 0 }: SectionRendererProps) {
  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => {
        const cleanedBody = stripDuplicateHeading(
          section.body || '',
          section.heading,
          section.headingNumber
        );
        
        const headingLevel = getSectionHeadingNumber(section.headingNumber);
        const imsLinks = getAllIMSLinks(section);

        // Determine heading styles based on level
        // Level 1 (e.g., "2"): Large, bold, uppercase
        // Level 2 (e.g., "2.1"): Medium, bold
        // Level 3+ (e.g., "2.1.1"): Smaller
        const headingStyles = headingLevel === 1
          ? 'text-xl font-bold text-foreground uppercase tracking-wide'
          : headingLevel === 2
          ? 'text-lg font-semibold text-foreground'
          : 'text-base font-medium text-foreground';

        const sectionSpacing = headingLevel === 1
          ? 'mt-10 first:mt-0'
          : headingLevel === 2
          ? 'mt-6'
          : 'mt-4';

        return (
          <div key={section.id} className={sectionSpacing}>
            {/* Section heading */}
            {(section.headingNumber || section.heading) && (
              <h2 className={cn(headingStyles, 'mb-3')}>
                {section.headingNumber ? `${section.headingNumber} ` : ''}
                {section.heading || ''}
              </h2>
            )}
            
            {/* Section body */}
            {cleanedBody?.trim() ? (
              <HtmlContent html={cleanedBody} />
            ) : (
              !section.children.length && (
                <p className="text-muted-foreground italic">
                  No content for this section.
                </p>
              )
            )}
            
            {/* IMS Procedure Links */}
            {imsLinks.length > 0 && (
              <IMSLinkRenderer links={imsLinks} />
            )}
            
            {/* Nested sections */}
            {section.children.length > 0 && (
              <SectionRenderer sections={section.children} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </>
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

  const displayTitle = plan.title || `${plan.type.replace('_', ' ')} Plan`;

  const handleSaved = () => {
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
    <div className="max-w-4xl">
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
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

      {/* Document Content - clean display without card wrapper */}
      {sections.length > 0 ? (
        <article>
          <SectionRenderer sections={sections} />
        </article>
      ) : (
        <p className="text-muted-foreground text-center py-12">
          No content has been generated for this plan yet.
        </p>
      )}

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-border">
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
