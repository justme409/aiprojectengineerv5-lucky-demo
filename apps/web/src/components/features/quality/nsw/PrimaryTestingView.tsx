'use client'

import { useState, useEffect } from 'react'

export default function PrimaryTestingView({ projectId }: { projectId: string }) {
	const [contracts, setContracts] = useState<any[]>([])
	useEffect(() => {
		const load = async () => {
			const res = await fetch(`/api/v1/projects/${projectId}/quality/primary-testing?action=contracts`)
			const json = await res.json()
			setContracts(json.data || [])
		}
		load()
	}, [projectId])
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">Primary Testing (NSW)</h1>
			<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(contracts, null, 2)}</pre>
		</div>
	)
}


