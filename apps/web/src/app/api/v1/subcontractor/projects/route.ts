import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

/**
 * GET /api/v1/subcontractor/projects
 * Returns projects assigned to the current user as a subcontractor
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Find projects where user has subcontractor role (via project_members or roles)
        const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        COALESCE(lot_stats.active_lots, 0) as "activeLots",
        COALESCE(lot_stats.pending_inspections, 0) as "pendingInspections"
      FROM public.projects p
      INNER JOIN public.project_members pm ON pm.project_id = p.id
      LEFT JOIN public.roles r ON r.id = pm.role_id
      LEFT JOIN LATERAL (
        SELECT 
          COUNT(*) FILTER (WHERE a.status IN ('active', 'in_progress', 'open')) as active_lots,
          COUNT(*) FILTER (WHERE a.approval_state = 'pending_review') as pending_inspections
        FROM public.assets a
        WHERE a.project_id = p.id 
          AND a.type = 'lot'
          AND COALESCE(a.is_deleted, false) = false
      ) lot_stats ON true
      WHERE pm.user_id = $1
        AND (
          r.code = 'subcontractor' 
          OR 'subcontractor' = ANY(pm.permissions)
          OR pm.abac_attributes->>'role' = 'subcontractor'
        )
      ORDER BY p.name
    `;

        const { rows } = await pool.query(query, [userId]);

        return NextResponse.json({
            projects: rows,
            count: rows.length,
        });
    } catch (error) {
        console.error('subcontractor projects GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
