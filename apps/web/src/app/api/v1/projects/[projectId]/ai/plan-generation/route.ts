import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { planType } = body

    if (!planType) {
      return NextResponse.json({ error: 'planType is required' }, { status: 400 })
    }

    // Check user has access to project
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if a plan of this type already exists for the project
    const existingPlanCheck = await pool.query(`
      SELECT id FROM public.assets
      WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
    `, [projectId, planType])

    if (existingPlanCheck.rows.length > 0) {
      return NextResponse.json({
        error: `A ${planType} plan already exists for this project`,
        existing_plan_id: existingPlanCheck.rows[0].id
      }, { status: 409 })
    }

    // Here you would typically trigger the LangGraph workflow to generate the plan
    // For now, we'll return a placeholder response indicating the plan generation has started

    // Create a processing run record to track the plan generation
    const runId = crypto.randomUUID()
    const runUid = `plan-gen-${runId}`

    await pool.query(`
      INSERT INTO public.processing_runs (
        run_uid, run_id, thread_id, agent_id, model, status, project_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      runUid,
      runId,
      `thread-${runId}`,
      'plan-generator',
      'gemini-2.5-pro',
      'running',
      projectId,
      (session.user as any).id
    ])

    // TODO: Actually trigger the LangGraph workflow for plan generation
    // This would involve calling the LangGraph server with the appropriate parameters

    return NextResponse.json({
      success: true,
      message: `Plan generation started for ${planType}`,
      run_id: runUid,
      plan_type: planType,
      status: 'running'
    })

  } catch (error) {
    console.error('Error generating plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check plan generation status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      // Return list of existing plans for the project
      const plansResult = await pool.query(`
        SELECT id, name, subtype, status, created_at, updated_at
        FROM public.assets
        WHERE project_id = $1 AND type = 'plan' AND is_current = true
        ORDER BY created_at DESC
      `, [projectId])

      return NextResponse.json({
        plans: plansResult.rows,
        total: plansResult.rows.length
      })
    }

    // Check specific run status
    const runResult = await pool.query(`
      SELECT status, started_at, ended_at, error_message
      FROM public.processing_runs
      WHERE run_uid = $1 AND project_id = $2
    `, [runId, projectId])

    if (runResult.rows.length === 0) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    const run = runResult.rows[0]
    return NextResponse.json({
      run_id: runId,
      status: run.status,
      started_at: run.started_at,
      ended_at: run.ended_at,
      error_message: run.error_message
    })

  } catch (error) {
    console.error('Error fetching plan generation status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

