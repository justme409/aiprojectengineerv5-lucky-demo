import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

/**
 * GET /api/v1/projects/[projectId]/member/role
 * Returns the current user's role for a specific project
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

        // First check project_members for explicit role
        const memberQuery = `
      SELECT 
        pm.role_id,
        r.code as role_code,
        r.name as role_name,
        pm.permissions,
        pm.abac_attributes
      FROM public.project_members pm
      LEFT JOIN public.roles r ON r.id = pm.role_id
      WHERE pm.project_id = $1 AND pm.user_id = $2
    `;
        const memberResult = await pool.query(memberQuery, [projectId, userId]);

        if (memberResult.rows.length > 0) {
            const member = memberResult.rows[0];
            return NextResponse.json({
                role: member.role_code || 'site_engineer', // Default if no role code set
                roleName: member.role_name,
                roleId: member.role_id,
                permissions: member.permissions || [],
                attributes: member.abac_attributes || {},
            });
        }

        // Check organization-level access (implied admin/full access)
        const orgQuery = `
      SELECT 
        ou.role_id,
        r.code as role_code,
        r.name as role_name,
        ou.attributes
      FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      LEFT JOIN public.roles r ON r.id = ou.role_id
      WHERE p.id = $1 AND ou.user_id = $2
    `;
        const orgResult = await pool.query(orgQuery, [projectId, userId]);

        if (orgResult.rows.length > 0) {
            const orgUser = orgResult.rows[0];
            return NextResponse.json({
                role: orgUser.role_code || 'admin', // Org users default to admin
                roleName: orgUser.role_name || 'Organization Admin',
                roleId: orgUser.role_id,
                permissions: ['admin'], // Full permissions for org users
                attributes: orgUser.attributes || {},
                isOrgUser: true,
            });
        }

        // No access found
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    } catch (error) {
        console.error('member/role GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
