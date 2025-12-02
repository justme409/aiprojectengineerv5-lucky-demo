import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';
import { neo4jClient } from '@/lib/neo4j';

/**
 * POST /api/v1/projects/[projectId]/plans/[planType]/update
 * Update management plan metadata in Neo4j
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, planType } = await params;
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

    // Normalize plan type to uppercase
    const normalizedPlanType = planType.toUpperCase();

    // Build the update query dynamically based on provided fields
    const allowedFields = ['title', 'summary', 'notes', 'approvalStatus'];
    const updates: string[] = [];
    const updateParams: Record<string, unknown> = {
      projectId,
      planType: normalizedPlanType,
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`m.${field} = $${field}`);
        updateParams[field] = body[field];
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update the management plan in Neo4j
    const query = `
      MATCH (m:ManagementPlan {projectId: $projectId, type: $planType})
      WHERE COALESCE(m.isDeleted, false) = false
      SET ${updates.join(', ')},
          m.updatedAt = datetime()
      RETURN m
    `;

    const result = await neo4jClient.write(query, updateParams);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan: result[0] });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

