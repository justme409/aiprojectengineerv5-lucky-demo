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

  // The data structure has section headers (with section field set) followed by items (with section NULL)
  // We need to track the current section and assign items to it
  const sections: { key: string; name: string; items: InspectionPointNode[] }[] = [];
  let currentSection: { key: string; name: string; items: InspectionPointNode[] } | null = null;

  sorted.forEach((point) => {
    // Check if this is a section header
    // Section headers have the section field set AND either:
    // 1. No acceptance criteria (section headers don't have criteria)
    // 2. Description closely matches the humanized section name
    const hasSection = !!point.section;
    const noAcceptanceCriteria = !point.acceptanceCriteria || point.acceptanceCriteria.trim() === '';
    const descMatchesSection = point.description && point.section && 
      (point.description.toLowerCase().replace(/[^a-z]/g, '').includes(point.section.toLowerCase().replace(/[^a-z]/g, '')) ||
       point.section.toLowerCase().replace(/[^a-z]/g, '').includes(point.description.toLowerCase().replace(/[^a-z]/g, '')));
    
    const isLikelySectionHeader = hasSection && noAcceptanceCriteria && descMatchesSection;
    
    if (isLikelySectionHeader) {
      // This is a section header - start a new section
      currentSection = {
        key: point.section!.toLowerCase(),
        name: point.description || humanizeSection(point.section!),
        items: []
      };
      sections.push(currentSection);
    } else if (currentSection) {
      // This is an item - add to current section
      currentSection.items.push(point);
    } else {
      // No current section yet - create an "Other" section
      currentSection = {
        key: 'other',
        name: 'Other',
        items: [point]
      };
      sections.push(currentSection);
    }
  });

  // Build items with proper numbering: Section 1, 2, 3... Items 1.1, 1.2, 2.1, etc.
  sections.forEach((section, sectionIndex) => {
    const sectionNumber = sectionIndex + 1;
    
    // Add section header
    items.push({
      id: `section-${section.key.replace(/[^a-z0-9]+/g, '-')}`,
      itemNumber: `${sectionNumber}`,
      sequence: 0,
      section: section.name,
      isSection: true,
      description: section.name,
      acceptanceCriteria: '',
      requirement: '',
      testMethod: '',
      testFrequency: '',
      responsibleParty: '',
      isHoldPoint: false,
      isWitnessPoint: false,
    });

    // Add items with sub-numbering
    section.items.forEach((point, itemIndex) => {
      const itemNumber = `${sectionNumber}.${itemIndex + 1}`;

      items.push({
        id: point.id ?? `point-${sectionNumber}-${itemIndex}`,
        itemNumber,
        sequence: point.sequence,
        section: section.name,
        isSection: false,
        description: point.description ?? '',
        acceptanceCriteria: point.acceptanceCriteria ?? '',
        embeddedTablesJson: (point as any).embeddedTablesJson ?? '',
        embeddedFiguresJson: (point as any).embeddedFiguresJson ?? '',
        sectionLinksJson: (point as any).sectionLinksJson ?? '',
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
