'use client'

import { useEffect, useState } from 'react'

export default function MaterialApprovalsRegister({ projectId }: { projectId: string }) {
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/v1/materials?project_id=${projectId}&type=approvals`)
				const json = await res.json()
				setRows(json.data || [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [projectId])

	if (loading) return <div className="p-4">Loading...</div>

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">Material Approvals</h1>
			<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(rows, null, 2)}</pre>
		</div>
	)
}


