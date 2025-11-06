import { notFound } from 'next/navigation';
import { InspectionPointNode, ITPTemplateNode, ITP_TEMPLATE_QUERIES } from '@/schemas/neo4j';
import { neo4jClient } from '@/lib/neo4j';
import ItpTemplateDetailClient from '@/components/features/itp/ItpTemplateDetailClient';

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
  const sectionAdded = new Set<string>();

  sorted.forEach((point, index) => {
    const sectionKey = point.section ? point.section.toLowerCase() : null;
    const sectionId = sectionKey ? `section-${sectionKey.replace(/[^a-z0-9]+/g, '-')}` : null;

    if (sectionId && !sectionAdded.has(sectionId)) {
      sectionAdded.add(sectionId);
      items.push({
        id: sectionId,
        item_no: '',
        parentId: null,
        section_name: humanizeSection(point.section!),
        inspection_test_point: '',
        acceptance_criteria: '',
        specification_clause: '',
        inspection_test_method: '',
        frequency: '',
        responsibility: '',
        hold_witness_point: '',
        standards_reference: [],
        'Inspection/Test Point': '',
        'Acceptance Criteria': '',
        'Specification Clause': '',
        'Inspection/Test Method': '',
        Frequency: '',
        Responsibility: '',
        'Hold/Witness Point': '',
      });
    }

    const holdWitnessParts = [];
    if (point.isHoldPoint) holdWitnessParts.push('Hold');
    if (point.isWitnessPoint) holdWitnessParts.push('Witness');
    const holdWitness = holdWitnessParts.join(' / ');

    const sequenceValue = point.sequence ?? index + 1;
    const itemNumber = (index + 1).toString().padStart(2, '0');

    items.push({
      id: point.id ?? `point-${index}`,
      item_no: itemNumber,
      parentId: sectionId ?? 'root',
      section_name: point.section ? humanizeSection(point.section) : undefined,
      type: point.type,
      inspection_test_point: point.description ?? '',
      acceptance_criteria: point.acceptanceCriteria ?? '',
      specification_clause: point.requirement ?? '',
      inspection_test_method: point.testMethod ?? '',
      frequency: point.testFrequency ?? '',
      responsibility: point.responsibleParty ?? '',
      hold_witness_point: holdWitness,
      standards_reference: point.standardsRef ?? [],
      isHoldPoint: point.isHoldPoint,
      isWitnessPoint: point.isWitnessPoint,
      'Inspection/Test Point': point.description ?? '',
      'Acceptance Criteria': point.acceptanceCriteria ?? '',
      'Specification Clause': point.requirement ?? '',
      'Inspection/Test Method': point.testMethod ?? '',
      Frequency: point.testFrequency ?? '',
      Responsibility: point.responsibleParty ?? '',
      'Hold/Witness Point': holdWitness,
    });
  });

  return items;
}

async function getTemplate(projectId: string, templateId: string): Promise<{ template: ITPTemplateNode; points: InspectionPointNode[] } | null> {
  const docNo = decodeURIComponent(templateId);

  const result = await neo4jClient.readOne<{ template: ITPTemplateNode; points: InspectionPointNode[] }>(
    ITP_TEMPLATE_QUERIES.getTemplateWithPoints,
    { projectId, docNo }
  );

  if (!result || !result.template) {
    return null;
  }

  return {
    template: result.template,
    points: Array.isArray(result.points) ? (result.points.filter(Boolean) as InspectionPointNode[]) : [],
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { projectId, templateId } = await params;

  const data = await getTemplate(projectId, templateId);

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
      itp_items: mapInspectionPointsToItpItems(points),
      revision: template.revisionNumber,
    },
  };

  return (
    <ItpTemplateDetailClient
      template={templateWithContent}
      projectId={projectId}
      templateId={template.id ?? decodeURIComponent(templateId)}
      projectName={template.description ?? template.docNo}
    />
  );
}

