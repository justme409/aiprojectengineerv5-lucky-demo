import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'
import { nextNumberRevision } from '@/lib/revision'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Check access
    const userId = (session.user as any).id
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, userId])

    if (accessCheck.rows.length === 0) {
      const memberCheck = await pool.query(`
        SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2
      `, [projectId, userId])
      if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    let query = `
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.type = 'approval_workflow'
    `
    const params = [projectId]
    let paramIndex = 2

    if (status) {
      query += ` AND a.content->>'status' = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ` ORDER BY a.created_at DESC`

    const result = await pool.query(query, params)
    return NextResponse.json({ workflows: result.rows })
  } catch (error) {
    console.error('Error fetching approval workflows:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, name, workflowDefinition, targetAssetId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const orgAccess = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, userId])
    if (orgAccess.rows.length === 0) {
      const memberAccess = await pool.query(`
        SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2
      `, [projectId, userId])
      if (memberAccess.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const spec = {
      asset: {
        type: 'approval_workflow',
        name,
        project_id: projectId,
        content: {
          workflow_definition: workflowDefinition,
          target_asset_id: targetAssetId,
          status: 'pending',
          current_step: 0
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `approval_workflow:${name}:${projectId}`,
      audit_context: { action: 'create_approval_workflow', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating approval workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action, decision, comment } = body

    const userId = (session.user as any).id

    if (action === 'advance') {
      const wfRes = await pool.query(`SELECT project_id FROM public.assets WHERE id=$1 AND type='approval_workflow'`, [id])
      if (wfRes.rows.length === 0) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }
      const projectId = wfRes.rows[0].project_id as string
      const orgAccess = await pool.query(`
        SELECT 1 FROM public.projects p
        JOIN public.organization_users ou ON ou.organization_id = p.organization_id
        WHERE p.id = $1 AND ou.user_id = $2
      `, [projectId, userId])
      if (orgAccess.rows.length === 0) {
        const memberAccess = await pool.query(`
          SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2
        `, [projectId, userId])
        if (memberAccess.rows.length === 0) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
      // Advance workflow step
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(
          jsonb_set(content, '{current_step}', (content->>'current_step')::int + 1),
          '{status}', '"in_progress"'
        ),
            updated_at = now(), updated_by = $1
        WHERE id = $2
      `, [userId, id])

      return NextResponse.json({ message: 'Workflow advanced' })
  } else if (action === 'decide') {
      // Fetch workflow to find target asset
      const wfRes = await pool.query(`SELECT id, project_id, content FROM public.assets WHERE id = $1 AND type = 'approval_workflow'`, [id])
      if (wfRes.rows.length === 0) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
      }
      const wf = wfRes.rows[0]
      const content = wf.content || {}
      const targetAssetId = content?.target_asset_id as string | undefined

      const orgAccess = await pool.query(`
        SELECT 1 FROM public.projects p
        JOIN public.organization_users ou ON ou.organization_id = p.organization_id
        WHERE p.id = $1 AND ou.user_id = $2
      `, [wf.project_id, userId])
      if (orgAccess.rows.length === 0) {
        const memberAccess = await pool.query(`
          SELECT 1 FROM public.project_members pm WHERE pm.project_id = $1 AND pm.user_id = $2
        `, [wf.project_id, userId])
        if (memberAccess.rows.length === 0) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }

      // Record approval decision on the workflow
      const decisionPayload = {
        decision,
        decided_by: userId,
        decided_at: new Date().toISOString(),
        comment: comment ?? null
      }

      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(
          jsonb_set(content, '{decision}', $1::jsonb),
          '{status}', '"completed"'
        ),
            updated_at = now(), updated_by = $2
        WHERE id = $3
      `, [JSON.stringify(decisionPayload), userId, id])

      // If approved, create APPROVED_BY edge on the workflow (requirements: properties.approved_at)
      if (decision === 'approve') {
        try {
          const email = (session.user as any)?.email as string | undefined
          let userAssetId: string | null = null
          if (email) {
            // Try find existing user asset by name=email
            const findUser = await pool.query(`SELECT id FROM public.asset_heads WHERE type = 'user' AND name = $1 LIMIT 1`, [email])
            if (findUser.rows.length > 0) {
              userAssetId = findUser.rows[0].id
            } else {
              // Create minimal user asset scoped to the workflow's project for org resolution
              const spec = {
                asset: {
                  type: 'user',
                  name: email,
                  project_id: wf.project_id as string | null,
                  content: { email },
                },
                edges: [],
                idempotency_key: `user:${email}:${wf.project_id || 'org'}`,
                audit_context: { action: 'ensure_user_asset', user_id: (session.user as any).id }
              }
              const { upsertAssetsAndEdges } = await import('@/lib/actions/graph-repo')
              const created = await upsertAssetsAndEdges(spec, (session.user as any).id)
              userAssetId = created.id
            }
          }
          if (userAssetId) {
            const edgeKey = `APPROVED_BY:workflow:${id}:user:${userAssetId}`
            await pool.query(
              `INSERT INTO public.asset_edges (id, from_asset_id, to_asset_id, edge_type, properties, idempotency_key)
               VALUES (gen_random_uuid(), $1, $2, 'APPROVED_BY', $3::jsonb, $4)
               ON CONFLICT (edge_type, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
              [id, userAssetId, JSON.stringify({ approved_at: new Date().toISOString() }), edgeKey]
            )
          }
        } catch (e) {
          console.warn('Failed to record APPROVED_BY edge for workflow:', e)
        }
      }

      // Update target asset state based on decision (only if target exists)
      if (targetAssetId) {
        if (decision === 'approve') {
          // Compute next numeric revision based on last approved for the same asset_uid
          const tRes = await pool.query(`SELECT asset_uid FROM public.assets WHERE id = $1`, [targetAssetId])
          const assetUid = tRes.rows?.[0]?.asset_uid as string | undefined
          let nextRev = '0'
          if (assetUid) {
            const lastApproved = await pool.query(
              `SELECT revision_code FROM public.assets WHERE asset_uid = $1 AND approval_state='approved' AND NOT is_deleted ORDER BY version DESC LIMIT 1`,
              [assetUid]
            )
            const currentNumeric = lastApproved.rows?.[0]?.revision_code as string | null
            nextRev = nextNumberRevision(currentNumeric)
          }
          await pool.query(`
            UPDATE public.assets
            SET status = 'approved', approval_state = 'approved', revision_code = $1, updated_at = now(), updated_by = $2
            WHERE id = $3
          `, [nextRev, (session.user as any).id, targetAssetId])
        } else if (decision === 'reject') {
          await pool.query(`
            UPDATE public.assets
            SET status = 'draft', approval_state = 'rejected', updated_at = now(), updated_by = $1,
                content = jsonb_set(COALESCE(content, '{}'::jsonb), '{client_feedback}', to_jsonb($3::text), true)
            WHERE id = $2
          `, [(session.user as any).id, targetAssetId, comment ?? ''])
        }
      }

      return NextResponse.json({ message: 'Decision recorded', targetAssetId })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating approval workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
