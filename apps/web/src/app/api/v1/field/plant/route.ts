import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const type = searchParams.get('type') // 'prestart' or 'all'

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    let query = `
      SELECT a.*,
             json_agg(json_build_object(
               'id', pa.id,
               'check_type', pa.check_type,
               'status', pa.status,
               'notes', pa.notes,
               'checked_at', pa.checked_at,
               'checked_by', pa.checked_by
             )) as prestart_checks
      FROM public.asset_heads a
      LEFT JOIN public.plant_prestart pa ON pa.plant_asset_id = a.id
      WHERE a.project_id = $1 AND a.type = 'plant_prestart'
    `

    const queryParams = [projectId]

    if (type === 'prestart') {
      query += ` AND a.subtype = 'prestart_check'`
    }

    query += `
      GROUP BY a.id, a.asset_uid, a.version, a.is_current, a.supersedes_asset_id,
               a.version_label, a.effective_from, a.effective_to, a.type, a.subtype,
               a.name, a.organization_id, a.project_id, a.parent_asset_id, a.document_number,
               a.revision_code, a.path_key, a.status, a.approval_state, a.classification,
               a.idempotency_key, a.metadata, a.content, a.due_sla_at, a.scheduled_at,
               a.requested_for_at, a.created_at, a.created_by, a.updated_at, a.updated_by, a.is_deleted
      ORDER BY a.created_at DESC
    `

    const result = await pool.query(query, queryParams)

    return NextResponse.json({ plant: result.rows })
  } catch (error) {
    console.error('Error fetching plant records:', error)
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
    const { projectId, equipmentName, equipmentType, registration, location, prestartChecks } = body

    if (!projectId || !equipmentName) {
      return NextResponse.json({ error: 'Project ID and equipment name required' }, { status: 400 })
    }

    // Create plant asset
    const plantAsset = {
      asset: {
        type: 'plant_prestart',
        name: equipmentName,
        project_id: projectId,
        content: {
          equipment_type: equipmentType,
          registration,
          location,
          prestart_checks_count: prestartChecks?.length || 0
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `plant:${projectId}:${equipmentName}:${Date.now()}`,
      audit_context: { action: 'create_plant_record', user_id: (session.user as any).id }
    }

    // Import the upsert function
    const { upsertAssetsAndEdges } = await import('@/lib/actions/graph-repo')
    const result = await upsertAssetsAndEdges(plantAsset, (session.user as any).id)

    // If there are prestart checks, create them
    if (prestartChecks && prestartChecks.length > 0) {
      const checkPromises = prestartChecks.map(async (check: any) => {
        const checkResult = await pool.query(`
          INSERT INTO plant_prestart (
            plant_asset_id, check_type, status, notes, checked_by, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          result.id,
          check.type,
          check.status,
          check.notes,
          check.checkedBy,
          (session.user as any).id
        ])
        return checkResult.rows[0]
      })

      await Promise.all(checkPromises)
    }

    return NextResponse.json({
      plant: result,
      message: 'Plant record created successfully'
    })
  } catch (error) {
    console.error('Error creating plant record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}