import { NextRequest } from 'next/server'
import { createSiteInstruction, getFieldAssets } from '@/lib/actions/field-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	if (!projectId) return new Response('project_id required', { status: 400 })
	const instructions = await getFieldAssets(projectId, 'site_instruction')
	return Response.json({ data: instructions })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const result = await createSiteInstruction(body)
	return Response.json(result)
}
