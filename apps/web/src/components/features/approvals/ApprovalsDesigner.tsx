'use client'

import { useEffect, useMemo, useState } from 'react'

export default function ApprovalsDesigner({ projectId }: { projectId: string }) {
	const [workflows, setWorkflows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [targetAssetId, setTargetAssetId] = useState('')
	const [targetAssetType, setTargetAssetType] = useState('itp_document')
	const [steps, setSteps] = useState<any[]>([])

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/v1/approvals/workflows?project_id=${projectId}`)
				const json = await res.json()
				setWorkflows(json.data || [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [projectId])

	const createWorkflow = async () => {
		const body = {
			action: 'create_workflow',
			project_id: projectId,
			name,
			description,
			target_asset_id: targetAssetId,
			target_asset_type: targetAssetType,
			steps: steps.length ? steps : [
				{ step_number: 1, name: 'Review', description: 'Initial review', approvers: [], approval_type: 'any', due_days: 3 }
			]
		}
		const res = await fetch('/api/v1/approvals/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
		if (res.ok) {
			const refreshed = await fetch(`/api/v1/approvals/workflows?project_id=${projectId}`).then(r => r.json())
			setWorkflows(refreshed.data || [])
			setName('')
			setDescription('')
			setTargetAssetId('')
		}
	}

	const workflowList = useMemo(() => workflows.map(w => (
		<li key={w.id} className="border rounded p-3">
			<div className="font-semibold">{w.name}</div>
			<div className="text-sm text-muted-foreground">{w.content?.description}</div>
			<div className="text-xs">Target: {w.content?.target_asset_type} → {w.content?.target_asset_id}</div>
		</li>
	)), [workflows])

	if (loading) return <div className="p-4">Loading...</div>

	return (
		<div className="space-y-6 p-4">
			<h1 className="text-2xl font-bold">Approvals Designer</h1>
			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-2">
					<input className="border rounded px-2 py-1 w-full" placeholder="Workflow name" value={name} onChange={e => setName(e.target.value)} />
					<input className="border rounded px-2 py-1 w-full" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
					<input className="border rounded px-2 py-1 w-full" placeholder="Target asset id (uuid)" value={targetAssetId} onChange={e => setTargetAssetId(e.target.value)} />
					<select className="border rounded px-2 py-1 w-full" value={targetAssetType} onChange={e => setTargetAssetType(e.target.value)}>
						<option value="itp_document">itp_document</option>
						<option value="document">document</option>
						<option value="lot">lot</option>
					</select>
					<button onClick={createWorkflow} className="bg-black text-white rounded px-3 py-1">Create Workflow</button>
				</div>
				<div>
					<h2 className="font-semibold mb-2">Existing Workflows</h2>
					<ul className="space-y-2">{workflowList}</ul>
				</div>
			</div>
		</div>
	)
}


