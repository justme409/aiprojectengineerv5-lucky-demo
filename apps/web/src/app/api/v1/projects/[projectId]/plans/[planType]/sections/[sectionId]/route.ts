import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { neo4jClient } from '@/lib/neo4j';

/**
 * PATCH /api/v1/projects/[projectId]/plans/[planType]/sections/[sectionId]
 * Update a specific document section in Neo4j
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, planType, sectionId } = await params;
    const body = await req.json();

    // Access check via org membership OR project membership
    const userId = (session.user as any).id;
    const orgAccess = await pool.query(
      `SELECT 1 FROM public.projects p
       JOIN public.organization_users ou ON ou.organization_id = p.organization_id
       WHERE p.id = $1 AND ou.user_id = $2`,
      [projectId, userId]
    );
    if (orgAccess.rows.length === 0) {
      const projAccess = await pool.query(
        `SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2`,
        [projectId, userId]
      );
      if (projAccess.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Build the update query dynamically based on provided fields
    const allowedFields = ['heading', 'headingNumber', 'body', 'summary', 'level', 'orderIndex'];
    const updates: string[] = [];
    const updateParams: Record<string, unknown> = {
      projectId,
      sectionId,
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`s.${field} = $${field}`);
        updateParams[field] = body[field];
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update the section in Neo4j
    const query = `
      MATCH (s:DocumentSection {projectId: $projectId})
      WHERE s.id = $sectionId OR s.sectionId = $sectionId OR elementId(s) = $sectionId
      SET ${updates.join(', ')},
          s.updatedAt = datetime()
      RETURN s
    `;

    const result = await neo4jClient.write(query, updateParams);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, section: result[0] });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/v1/projects/[projectId]/plans/[planType]/sections/[sectionId]
 * Get a specific document section from Neo4j
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, sectionId } = await params;

    // Access check
    const userId = (session.user as any).id;
    const orgAccess = await pool.query(
      `SELECT 1 FROM public.projects p
       JOIN public.organization_users ou ON ou.organization_id = p.organization_id
       WHERE p.id = $1 AND ou.user_id = $2`,
      [projectId, userId]
    );
    if (orgAccess.rows.length === 0) {
      const projAccess = await pool.query(
        `SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2`,
        [projectId, userId]
      );
      if (projAccess.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const query = `
      MATCH (s:DocumentSection {projectId: $projectId})
      WHERE s.id = $sectionId OR s.sectionId = $sectionId OR elementId(s) = $sectionId
      RETURN s
    `;

    const result = await neo4jClient.read(query, { projectId, sectionId });

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

