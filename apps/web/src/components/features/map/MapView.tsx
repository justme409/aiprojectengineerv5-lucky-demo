"use client"

import { useEffect, useState } from 'react'

export function MapView({ projectId }: { projectId: string }) {
	const [features, setFeatures] = useState<any[]>([])
	useEffect(() => {
		const load = async () => {
			const res = await fetch(`/api/v1/gis?project_id=${projectId}`)
			const json = await res.json()
			setFeatures(json.data || [])
		}
		load()
	}, [projectId])
	return (
		<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(features, null, 2)}</pre>
	)
}
