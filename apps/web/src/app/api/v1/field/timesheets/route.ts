import { NextRequest } from 'next/server'
import { createTimesheet, getFieldAssets } from '@/lib/actions/field-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const userId = new URL(req.url).searchParams.get('user_id')

	if (!projectId) return new Response('project_id required', { status: 400 })

	const response = await getFieldAssets(projectId, 'timesheet')
	let timesheets = (response.success && Array.isArray((response as any).assets)) ? (response as any).assets : []

	// Filter by user if specified
	if (userId) {
		timesheets = timesheets.filter((t: any) => t.content?.user_id === userId)
	}

	return Response.json({ data: timesheets })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await createTimesheet(body)
	return Response.json(result)
}
