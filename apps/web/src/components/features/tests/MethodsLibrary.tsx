'use client'

import { useEffect, useState } from 'react'

export default function MethodsLibrary({ projectId }: { projectId: string }) {
	const [methods, setMethods] = useState<any[]>([])
	useEffect(() => {
		const load = async () => {
			const res = await fetch(`/api/v1/tests?project_id=${projectId}&type=methods`)
			const json = await res.json()
			setMethods(json.data || [])
		}
		load()
	}, [projectId])
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-2">Test Methods</h1>
			<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(methods, null, 2)}</pre>
		</div>
	)
}


