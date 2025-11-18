import type { ReactNode } from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HelpCircle } from 'lucide-react';

import {
  formatDateValue,
  formatPropertyValue,
  humanizeKey,
  PlanRelationshipRecord,
  PlanSectionWithChildren,
  safeStringify,
} from '@/lib/management-plans/plan-utils';
import { cn } from '@/lib/utils';
import type { ITPTemplateNode, ManagementPlanNode } from '@/schemas/neo4j';

const STATUS_BADGE_VARIANTS: Record<
  ManagementPlanNode['approvalStatus'],
  { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  in_review: { label: 'In Review', variant: 'default' },
  approved: { label: 'Approved', variant: 'success' },
  superseded: { label: 'Superseded', variant: 'destructive' },
};

const BADGE_TONE_MAP: Record<string, string> = {
  approved: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  draft: 'border-slate-200 bg-slate-100 text-slate-800',
  not_required: 'border-slate-200 bg-slate-100 text-slate-800',
  in_review: 'border-amber-200 bg-amber-100 text-amber-800',
  pending: 'border-amber-200 bg-amber-100 text-amber-800',
  rejected: 'border-rose-200 bg-rose-100 text-rose-800',
  superseded: 'border-rose-200 bg-rose-100 text-rose-800',
};

export interface PlanPageCopy {
  title: string;
  subtitle?: string;
  summaryTitle?: string;
  notesTitle?: string;
  sectionsTitle?: string;
  sectionsDescription?: string;
  relationshipsTitle?: string;
  relationshipsSubtitle?: string;
  additionalPropertiesTitle?: string;
  itpTitle?: string;
  itpSubtitle?: string;
  metadataTitle?: string;
  showItpSection?: boolean;
}

interface ManagementPlanDetailViewProps {
  projectId: string;
  plan: ManagementPlanNode;
  sections: PlanSectionWithChildren[];
  sectionCount: number;
  relationships: PlanRelationshipRecord[];
  itpTemplates: ITPTemplateNode[];
  copy: PlanPageCopy;
}

function ApprovalStatusBadge({
  status,
}: {
  status?: ManagementPlanNode['approvalStatus'] | string | null;
}) {
  if (!status) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
        <HelpCircle className="h-3 w-3" />
        Status not set
      </Badge>
    );
  }

  const normalized = status
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_') as ManagementPlanNode['approvalStatus'];

  const item = STATUS_BADGE_VARIANTS[normalized];

  if (!item) {
    console.warn('Unknown management plan approval status encountered', status);
    return (
      <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700">
        <HelpCircle className="h-3 w-3" />
        {status.toString().replace(/_/g, ' ')}
      </Badge>
    );
  }

  return <Badge variant={item.variant}>{item.label}</Badge>;
}

function formatBadgeTone(status: string | null | undefined) {
  if (!status) return 'border-secondary/40 bg-secondary/40 text-secondary-foreground';
  return BADGE_TONE_MAP[status.toLowerCase()] ?? 'border-secondary/40 bg-secondary/40 text-secondary-foreground';
}

function HtmlContent({ html, className }: { html?: string | null; className?: string }) {
  if (!html || typeof html !== 'string' || html.trim() === '') {
    return null;
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground',
        'prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground [&_*]:max-w-full',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderSectionTree(sections: PlanSectionWithChildren[]): JSX.Element | null {
  if (!sections.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="space-y-3">
          {section.body?.trim() ? (
            <HtmlContent html={section.body} className="text-sm leading-relaxed" />
          ) : (
            <>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {section.headingNumber ? `${section.headingNumber} ` : ''}
                  {section.heading || 'Untitled Section'}
                </h3>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Level {section.level ?? 0} • Order {section.orderIndex ?? 0}
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                No content captured for this section yet.
              </p>
            </>
          )}
          {section.children.length ? (
            <div className="space-y-4 border-l border-border/40 pl-4">
              {renderSectionTree(section.children)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ManagementPlanDetailView({
  projectId,
  plan,
  sections,
  sectionCount,
  relationships,
  itpTemplates,
  copy,
}: ManagementPlanDetailViewProps) {
  const metadataTitle = copy.metadataTitle ?? 'Plan Metadata';
  const sectionsTitle = copy.sectionsTitle ?? 'Plan Sections';
  const summaryTitle = copy.summaryTitle ?? 'Summary';
  const notesTitle = copy.notesTitle ?? 'Notes';
  const additionalPropertiesTitle = copy.additionalPropertiesTitle ?? 'Additional Properties';
  const relationshipsTitle = copy.relationshipsTitle ?? 'Related Neo4j Nodes';
  const relationshipsSubtitle =
    copy.relationshipsSubtitle ??
    `Direct outgoing relationships from this management plan (${relationships.length})`;
  const itpTitle = copy.itpTitle ?? 'Inspection & Test Plans';
  const itpSubtitle =
    copy.itpSubtitle ?? `Pulled from Neo4j ITPTemplate nodes (${itpTemplates.length})`;
  const showItpSection = copy.showItpSection ?? true;

  const metadata: Array<{ label: string; value: ReactNode }> = [
    { label: 'Neo4j Element ID', value: plan.id || '—' },
    { label: 'Project ID', value: plan.projectId },
    { label: 'Plan Type', value: plan.type },
    { label: 'Version', value: plan.version || '—' },
    { label: 'Status', value: <ApprovalStatusBadge status={plan.approvalStatus} /> },
    { label: 'Approved By', value: plan.approvedBy || '—' },
    { label: 'Approved Date', value: formatDateValue(plan.approvedDate) },
    { label: 'Created', value: formatDateValue(plan.createdAt) },
    { label: 'Last Updated', value: formatDateValue(plan.updatedAt) },
  ];

  const displayedKeys = new Set([
    'id',
    'projectId',
    'type',
    'title',
    'version',
    'approvalStatus',
    'approvedBy',
    'approvedDate',
    'createdAt',
    'updatedAt',
    'summary',
    'notes',
    'requiredItps',
  ]);

  const extraProperties = Object.entries(plan as unknown as Record<string, unknown>)
    .filter(([key, value]) => {
      if (displayedKeys.has(key)) {
        return false;
      }
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    })
    .map(([key, value]) => ({ key, value }));

  const requiredItps = Array.isArray(plan.requiredItps) ? plan.requiredItps : [];
  const sortedItps = [...itpTemplates].sort((a, b) => a.docNo.localeCompare(b.docNo));
  const templatesWithAdditionalDetails = sortedItps.filter(
    (template) =>
      Boolean(template.jurisdiction) ||
      Boolean(template.agency) ||
      (Array.isArray(template.applicableStandards) && template.applicableStandards.length > 0),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        {copy.subtitle ? (
          <p className="text-muted-foreground mt-2">{copy.subtitle}</p>
        ) : null}
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-3">{metadataTitle}</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metadata.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {plan.summary && (
              <div className="pt-4 border-t border-border/40">
                <h3 className="text-sm font-semibold mb-2">{summaryTitle}</h3>
                <HtmlContent html={plan.summary} className="text-sm text-muted-foreground leading-relaxed" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {plan.notes ? (
        <Card>
          <CardContent className="py-4">
            <h2 className="text-lg font-semibold">{notesTitle}</h2>
            <HtmlContent html={plan.notes} className="text-sm text-muted-foreground" />
          </CardContent>
        </Card>
      ) : null}

      {requiredItps.length > 0 && (
        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Required ITPs</h2>
              <span className="text-sm text-muted-foreground">
                {requiredItps.length} required ITP{requiredItps.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {requiredItps.map((itp, index) => {
                const key = `${itp.docNo}-${index}`;
                return (
                  <div key={key} className="rounded border border-border/40 bg-muted/40 p-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{itp.docNo}</p>
                      <Badge
                        variant={itp.mandatory ? 'default' : 'outline'}
                        className={
                          itp.mandatory ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''
                        }
                      >
                        {itp.mandatory ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Work Type</dt>
                        <dd className="capitalize">{itp.workType.replace(/_/g, ' ')}</dd>
                      </div>
                      {itp.specRef && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Specification Reference
                          </dt>
                          <dd className="font-mono text-xs text-foreground">{itp.specRef}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {extraProperties.length ? (
        <Card>
          <CardContent className="py-4">
            <h2 className="text-lg font-semibold">{additionalPropertiesTitle}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {extraProperties.map(({ key, value }) => (
                <div key={key} className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {humanizeKey(key)}
                  </dt>
                  <dd className="text-sm text-foreground">{formatPropertyValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="py-6 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">{sectionsTitle}</h2>
            <span className="text-sm text-muted-foreground">
              {sectionCount ? `${sectionCount} sections` : 'No sections captured yet'}
            </span>
          </div>
          {copy.sectionsDescription ? (
            <p className="text-sm text-muted-foreground">{copy.sectionsDescription}</p>
          ) : null}
          {sections.length ? (
            renderSectionTree(sections)
          ) : (
            <p className="text-sm text-muted-foreground">
              Structured section nodes have not been created for this management plan yet.
            </p>
          )}
        </CardContent>
      </Card>

      {showItpSection ? (
        <Card>
          <CardContent className="py-4 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-lg font-semibold">{itpTitle}</h2>
              <span className="text-sm text-muted-foreground">{itpSubtitle}</span>
            </div>

            {sortedItps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ITP templates found for this project yet.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Work Type</TableHead>
                        <TableHead>Spec Ref</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Approval</TableHead>
                        <TableHead>Revision</TableHead>
                        <TableHead>Revision Date</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approved Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedItps.map((template, index) => {
                        const templateKey = template.id
                          ? String(template.id)
                          : `${template.docNo}-${template.revisionNumber}-${index}`;

                        return (
                          <TableRow key={templateKey}>
                            <TableCell className="font-medium text-sm">{template.docNo}</TableCell>
                            <TableCell className="text-sm text-foreground">
                              <div className="space-y-1">
                                <p>{template.description || '—'}</p>
                                {template.scopeOfWork && (
                                  <p className="text-xs text-muted-foreground italic">
                                    Scope: {template.scopeOfWork}
                                  </p>
                                )}
                                {template.notes && (
                                  <p className="text-xs text-muted-foreground">Note: {template.notes}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm capitalize text-foreground">
                              {template.workType?.replace(/_/g, ' ') || '—'}
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              <div className="space-y-1">
                                <p className="font-mono text-xs">{template.specRef || '—'}</p>
                                {template.parentSpec && (
                                  <p className="text-xs text-muted-foreground">Parent: {template.parentSpec}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={formatBadgeTone(template.status || '')}
                              >
                                {template.status ? template.status.replace(/_/g, ' ') : '—'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={formatBadgeTone(template.approvalStatus || '')}
                              >
                                {template.approvalStatus
                                  ? template.approvalStatus.replace(/_/g, ' ')
                                  : '—'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              v{template.revisionNumber || '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateValue(template.revisionDate)}
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              {template.approvedBy || '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateValue(template.approvedDate)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {templatesWithAdditionalDetails.length > 0 && (
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    <h3 className="text-sm font-semibold">Additional ITP Details</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {templatesWithAdditionalDetails.map((template, index) => {
                        const templateKey = template.id
                          ? String(template.id)
                          : `${template.docNo}-${template.revisionNumber}-${index}`;

                        return (
                          <div
                            key={templateKey}
                            className="rounded border border-border/30 bg-muted/30 p-3 space-y-2"
                          >
                            <p className="text-xs font-medium text-foreground">{template.docNo}</p>
                            {template.jurisdiction && (
                              <div>
                                <p className="text-xs text-muted-foreground">Jurisdiction</p>
                                <p className="text-xs text-foreground">{template.jurisdiction}</p>
                              </div>
                            )}
                            {template.agency && (
                              <div>
                                <p className="text-xs text-muted-foreground">Agency</p>
                                <p className="text-xs text-foreground">{template.agency}</p>
                              </div>
                            )}
                            {template.applicableStandards && template.applicableStandards.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">Standards</p>
                                <ul className="text-xs text-foreground list-disc list-inside">
                                  {template.applicableStandards.map((standard, standardIndex) => (
                                    <li key={standardIndex}>{standard}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="py-4 space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-lg font-semibold">{relationshipsTitle}</h2>
            <span className="text-sm text-muted-foreground">{relationshipsSubtitle}</span>
          </div>

          {relationships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No related nodes found for this management plan at the moment.
            </p>
          ) : (
            <div className="space-y-4">
              {relationships.map((relation, index) => {
                const target = relation.target as Record<string, unknown> | null;
                const targetId = target?.id ?? target?.projectId ?? target?.code ?? target?.slug ?? index;
                const targetKeys = target ? Object.keys(target).filter((k) => !['id', 'projectId'].includes(k)) : [];

                return (
                  <div
                    key={`${relation.relationshipType}-${targetId}`}
                    className="rounded border border-border/40 bg-muted/40 p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {relation.targetLabels?.[0] ?? 'Node'}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Labels: {relation.targetLabels?.join(', ') || '—'}
                        </p>
                        {targetId && (
                          <p className="text-xs text-muted-foreground font-mono">ID: {String(targetId)}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        {relation.relationshipType?.replace(/_/g, ' ') ?? 'Related'}
                      </Badge>
                    </div>
                    {target && targetKeys.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {targetKeys.slice(0, 12).map((key) => {
                            const value = target[key];
                            if (value === null || value === undefined) return null;
                            if (typeof value === 'string' && value.trim() === '') return null;
                            if (Array.isArray(value) && value.length === 0) return null;

                            return (
                              <div key={key} className="flex flex-col gap-1">
                                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {humanizeKey(key)}
                                </dt>
                                <dd className="text-sm text-foreground">{formatPropertyValue(value)}</dd>
                              </div>
                            );
                          })}
                        </dl>
                        {targetKeys.length > 12 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            + {targetKeys.length - 12} more properties (see raw payload below)
                          </p>
                        )}
                      </div>
                    )}
                    <details className="mt-3">
                      <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                        View Full Raw Data
                      </summary>
                      <pre className="mt-2 overflow-x-auto rounded border border-border/30 bg-background p-3 text-xs leading-relaxed text-foreground">
                        {safeStringify(relation.target)}
                      </pre>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Link
          href={`/projects/${projectId}/management-plans`}
          className="hover:underline text-blue-600"
        >
          ← Back to Management Plans
        </Link>
      </div>
    </div>
  );
}


