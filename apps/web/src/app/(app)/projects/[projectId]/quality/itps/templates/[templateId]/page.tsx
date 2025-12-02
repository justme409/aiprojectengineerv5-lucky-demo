import { notFound } from 'next/navigation';
import { 
  InspectionPointNode, 
  ITPTemplateNode, 
  ITP_TEMPLATE_QUERIES,
} from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import ItpTemplateDetailClientTabbed from '@/components/features/itp/ItpTemplateDetailClientTabbed';

interface PageProps {
  params: Promise<{ projectId: string; templateId: string }>;
}

function humanizeSection(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function mapInspectionPointsToItpItems(points: InspectionPointNode[]) {
  const items: any[] = [];
  const sorted = [...points].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

  // Filter out section-type entries and only process actual inspection points
  const inspectionPoints = sorted.filter(point => point.type !== 'section');
  
  // Group points by section
  const sectionOrder: string[] = [];
  const sectionPoints: Record<string, InspectionPointNode[]> = {};
  
  inspectionPoints.forEach((point) => {
    const sectionKey = point.section ? point.section.toLowerCase() : 'other';
    if (!sectionPoints[sectionKey]) {
      sectionPoints[sectionKey] = [];
      sectionOrder.push(sectionKey);
    }
    sectionPoints[sectionKey].push(point);
  });

  // Build items with proper numbering: Section 1, 2, 3... Items 1.1, 1.2, 2.1, etc.
  sectionOrder.forEach((sectionKey, sectionIndex) => {
    const sectionNumber = sectionIndex + 1;
    const pointsInSection = sectionPoints[sectionKey];
    const firstPoint = pointsInSection[0];
    const sectionName = firstPoint?.section ? humanizeSection(firstPoint.section) : 'Other';
    
    // Add section header
    items.push({
      id: `section-${sectionKey.replace(/[^a-z0-9]+/g, '-')}`,
      itemNumber: `${sectionNumber}`,
      sequence: 0,
      section: sectionName,
      isSection: true,
      description: sectionName,
      acceptanceCriteria: '',
      requirement: '',
      testMethod: '',
      testFrequency: '',
      responsibleParty: '',
      isHoldPoint: false,
      isWitnessPoint: false,
    });

    // Add items with sub-numbering
    pointsInSection.forEach((point, itemIndex) => {
      const itemNumber = `${sectionNumber}.${itemIndex + 1}`;

      items.push({
        id: point.id ?? `point-${sectionNumber}-${itemIndex}`,
        itemNumber,
        sequence: point.sequence,
        section: sectionName,
        isSection: false,
        description: point.description ?? '',
        acceptanceCriteria: point.acceptanceCriteria ?? '',
        embeddedTablesJson: (point as any).embeddedTablesJson ?? '',
        embeddedTables: (point as any).embeddedTables ?? [], // backward compatibility
        requirement: point.requirement ?? '',
        testMethod: point.testMethod ?? '',
        testFrequency: point.testFrequency ?? '',
        responsibleParty: point.responsibleParty ?? '',
        isHoldPoint: point.isHoldPoint ?? false,
        isWitnessPoint: point.isWitnessPoint ?? false,
        standardsRef: point.standardsRef ?? [],
      });
    });
  });

  return items;
}

interface TemplateData {
  template: ITPTemplateNode;
  points: InspectionPointNode[];
}

async function getTemplateWithPoints(projectId: string, templateId: string): Promise<TemplateData | null> {
  const docNo = decodeURIComponent(templateId);

  // Fetch template with points
  const templateResult = await neo4jClient.readOne<{ template: ITPTemplateNode; points: InspectionPointNode[] }>(
    ITP_TEMPLATE_QUERIES.getTemplateWithPoints,
    { projectId, docNo }
  );

  if (!templateResult || !templateResult.template) {
    return null;
  }

  return {
    template: templateResult.template,
    points: Array.isArray(templateResult.points) ? templateResult.points.filter(Boolean) : [],
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { projectId, templateId } = await params;

  const data = await getTemplateWithPoints(projectId, templateId);

  if (!data) {
    notFound();
  }

  const { template, points } = data;

  const baseContent = (template as any)?.content && typeof (template as any).content === 'object'
    ? { ...(template as any).content }
    : {};

  const templateWithContent: any = {
    ...template,
    id: template.id ?? template.docNo,
    name: template.description ?? template.docNo,
    content: {
      ...baseContent,
      items: mapInspectionPointsToItpItems(points),
      revision: template.revisionNumber,
    },
  };

  return (
    <ItpTemplateDetailClientTabbed
      template={templateWithContent}
      projectId={projectId}
      templateId={template.id ?? decodeURIComponent(templateId)}
      projectName={template.description ?? template.docNo}
    />
  );
}
