'use client'

import { useEffect, useState } from 'react'

export default function SampleRegister({ projectId }: { projectId: string }) {
	const [rows, setRows] = useState<any[]>([])
	useEffect(() => {
		const load = async () => {
			const res = await fetch(`/api/v1/tests?project_id=${projectId}&type=samples`)
			const json = await res.json()
			setRows(json.data || [])
		}
		load()
	}, [projectId])
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-2">Samples</h1>
			<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(rows, null, 2)}</pre>
		</div>
	)
}


