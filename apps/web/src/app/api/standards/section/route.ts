import { NextRequest, NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

// Standards database connection details
const NEO4J_STANDARDS_URI = process.env.NEO4J_STANDARDS_URI || 'neo4j://localhost:7687';
const NEO4J_STANDARDS_USER = process.env.NEO4J_STANDARDS_USER || 'neo4j';
const NEO4J_STANDARDS_PASSWORD = process.env.NEO4J_STANDARDS_PASSWORD || process.env.NEO4J_PASSWORD || '';

interface SectionRequest {
  documentNumber: string;
  sectionId: string;
}

interface Subsection {
  heading: string;
  headingNumber: string;
  text: string;
  semanticId: string;
}

interface SectionResponse {
  heading: string;
  headingNumber: string;
  text: string;
  documentName: string;
  subsections: Subsection[];
}

export async function POST(request: NextRequest) {
  let driver;
  let session;

  try {
    const body: SectionRequest = await request.json();
    const { documentNumber, sectionId } = body;

    if (!documentNumber || !sectionId) {
      return NextResponse.json(
        { error: 'documentNumber and sectionId are required' },
        { status: 400 }
      );
    }

    // Connect to Standards Neo4j database
    driver = neo4j.driver(
      NEO4J_STANDARDS_URI,
      neo4j.auth.basic(NEO4J_STANDARDS_USER, NEO4J_STANDARDS_PASSWORD)
    );

    session = driver.session({ database: 'neo4j' });

    // Query for the section content with subsections
    // Note: Sections have document_number property and parent-child links use :PARENT_OF relationship
    const result = await session.run(
      `
      MATCH (sec:DocumentSection {document_number: $documentNumber, semantic_id: $sectionId})
      OPTIONAL MATCH (sec)-[:PARENT_OF*1..]->(sub:DocumentSection)
      WITH sec, sub
      ORDER BY sub.heading_number
      RETURN 
        sec.heading as heading,
        sec.heading_number as headingNumber,
        sec.text as text,
        $documentNumber as documentName,
        collect(DISTINCT {
          heading: sub.heading,
          headingNumber: sub.heading_number,
          text: sub.text,
          semanticId: sub.semantic_id
        }) as subsections
      `,
      { documentNumber, sectionId }
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    const record = result.records[0];

    // Filter out null subsections (from OPTIONAL MATCH when no subsections exist)
    const rawSubsections = record.get('subsections') || [];
    const subsections: Subsection[] = rawSubsections
      .filter((sub: any) => sub && sub.heading !== null && sub.semanticId !== null)
      .map((sub: any) => ({
        heading: sub.heading || '',
        headingNumber: sub.headingNumber || '',
        text: sub.text || '',
        semanticId: sub.semanticId || '',
      }));

    const response: SectionResponse = {
      heading: record.get('heading') || '',
      headingNumber: record.get('headingNumber') || '',
      text: record.get('text') || '',
      documentName: record.get('documentName') || '',
      subsections,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching section content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section content' },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.close();
    }
    if (driver) {
      await driver.close();
    }
  }
}
