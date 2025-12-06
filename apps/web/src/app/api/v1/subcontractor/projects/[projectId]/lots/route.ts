import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

/**
 * GET /api/v1/subcontractor/projects/[projectId]/lots
 * Returns lots assigned to the current subcontractor in a specific project
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = await params;
        const userId = (session.user as any).id;

        // Verify user has subcontractor access to this project
        const accessQuery = `
      SELECT 1 FROM public.project_members pm
      LEFT JOIN public.roles r ON r.id = pm.role_id
      WHERE pm.project_id = $1 
        AND pm.user_id = $2
        AND (
          r.code = 'subcontractor' 
          OR 'subcontractor' = ANY(pm.permissions)
          OR pm.abac_attributes->>'role' = 'subcontractor'
        )
    `;
        const accessResult = await pool.query(accessQuery, [projectId, userId]);

        if (accessResult.rows.length === 0) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Fetch lots assigned to this subcontractor
        // This uses the assets table where lots are stored
        const lotsQuery = `
      SELECT 
        a.id,
        a.name as number,
        COALESCE(a.content->>'description', a.name) as description,
        COALESCE(a.status, 'open') as status,
        COALESCE((a.content->>'percentComplete')::int, 0) as "percentComplete",
        COALESCE(a.content->>'workType', '') as "workType",
        COALESCE(a.content->>'templateDocNo', '') as "templateDocNo",
        COALESCE(a.content->>'areaCode', '') as "areaCode",
        a.created_at as "startDate",
        COALESCE(inspection_stats.pending, 0) as "pendingInspections",
        COALESCE(inspection_stats.completed, 0) as "completedInspections",
        COALESCE(inspection_stats.total, 0) as "totalInspections"
      FROM public.assets a
      LEFT JOIN LATERAL (
        SELECT 
          COUNT(*) FILTER (WHERE ia.approval_state IN ('pending_review', 'pending')) as pending,
          COUNT(*) FILTER (WHERE ia.approval_state = 'approved') as completed,
          COUNT(*) as total
        FROM public.assets ia
        WHERE ia.project_id = a.project_id 
          AND ia.type = 'inspection_point'
          AND (ia.content->>'lotId' = a.id::text OR ia.content->>'lotNumber' = a.name)
          AND COALESCE(ia.is_deleted, false) = false
      ) inspection_stats ON true
      WHERE a.project_id = $1
        AND a.type = 'lot'
        AND COALESCE(a.is_deleted, false) = false
      ORDER BY a.name
    `;

        const { rows } = await pool.query(lotsQuery, [projectId]);

        return NextResponse.json({
            lots: rows,
            count: rows.length,
        });
    } catch (error) {
        console.error('subcontractor lots GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
