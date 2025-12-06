import { NextRequest, NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

// IMS database connection details (port 7689)
// See: pqp-demo/workspace-manifest/type2-supporting-info/type2-supporting-info-connections.md
const NEO4J_IMS_URI = process.env.NEO4J_IMS_URI || 'neo4j://localhost:7689';
const NEO4J_IMS_USER = process.env.NEO4J_IMS_USER || 'neo4j';
const NEO4J_IMS_PASSWORD = process.env.NEO4J_IMS_PASSWORD || 'ims_qse_2024_secure';

interface IMSDocumentRequest {
  imsId: string;
}

interface IMSDocumentResponse {
  id: string;
  title: string;
  type: string;
  category?: string;
  isoClause?: string;
  html: string;
}

export async function POST(request: NextRequest) {
  let driver;
  let session;

  try {
    const body: IMSDocumentRequest = await request.json();
    const { imsId } = body;

    if (!imsId) {
      return NextResponse.json(
        { error: 'imsId is required' },
        { status: 400 }
      );
    }

    // Connect to IMS Neo4j database
    driver = neo4j.driver(
      NEO4J_IMS_URI,
      neo4j.auth.basic(NEO4J_IMS_USER, NEO4J_IMS_PASSWORD)
    );

    session = driver.session({ database: 'neo4j' });

    // Query for the IMS document content
    const result = await session.run(
      `
      MATCH (item:QSEItem {id: $imsId})
      WHERE item.status = 'approved' OR item.status IS NULL
      RETURN 
        item.id as id,
        item.title as title,
        item.type as type,
        item.category as category,
        item.isoClause as isoClause,
        item.html as html
      LIMIT 1
      `,
      { imsId }
    );

    if (result.records.length === 0) {
      // Try fallback query with case-insensitive search
      const fallbackResult = await session.run(
        `
        MATCH (item:QSEItem)
        WHERE toUpper(item.id) = toUpper($imsId)
          AND (item.status = 'approved' OR item.status IS NULL)
        RETURN 
          item.id as id,
          item.title as title,
          item.type as type,
          item.category as category,
          item.isoClause as isoClause,
          item.html as html
        LIMIT 1
        `,
        { imsId }
      );

      if (fallbackResult.records.length === 0) {
        return NextResponse.json(
          { error: 'IMS document not found' },
          { status: 404 }
        );
      }

      const record = fallbackResult.records[0];
      const response: IMSDocumentResponse = {
        id: record.get('id') || imsId,
        title: record.get('title') || '',
        type: record.get('type') || 'Procedure',
        category: record.get('category') || undefined,
        isoClause: record.get('isoClause') || undefined,
        html: record.get('html') || '',
      };

      return NextResponse.json(response);
    }

    const record = result.records[0];
    const response: IMSDocumentResponse = {
      id: record.get('id') || imsId,
      title: record.get('title') || '',
      type: record.get('type') || 'Procedure',
      category: record.get('category') || undefined,
      isoClause: record.get('isoClause') || undefined,
      html: record.get('html') || '',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching IMS document content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IMS document content' },
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

