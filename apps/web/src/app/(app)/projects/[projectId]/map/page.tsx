'use client'

import { useParams } from 'next/navigation'
import { MapView } from '@/components/features/map/MapView'

export default function MapPage() {
	const params = useParams()
	const projectId = params.projectId as string
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">Map</h1>
			<MapView projectId={projectId} />
		</div>
	)
}


