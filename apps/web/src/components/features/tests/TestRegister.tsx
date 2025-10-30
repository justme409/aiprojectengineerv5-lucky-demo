'use client'

import { useEffect, useState } from 'react'

export default function TestRegister({ projectId }: { projectId: string }) {
	const [requests, setRequests] = useState<any[]>([])
	const [results, setResults] = useState<any[]>([])
	const [samples, setSamples] = useState<any[]>([])

	useEffect(() => {
		const load = async () => {
			const [r1, r2, r3] = await Promise.all([
				fetch(`/api/v1/tests?project_id=${projectId}&type=test_requests`).then(r => r.json()),
				fetch(`/api/v1/tests?project_id=${projectId}&type=test_results`).then(r => r.json()),
				fetch(`/api/v1/tests?project_id=${projectId}&type=samples`).then(r => r.json())
			])
			setRequests(r1.data || [])
			setResults(r2.data || [])
			setSamples(r3.data || [])
		}
		load()
	}, [projectId])

	return (
		<div className="p-4 space-y-4">
			<h1 className="text-2xl font-bold">Tests</h1>
			<section>
				<h2 className="font-semibold mb-2">Test Requests</h2>
				<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(requests, null, 2)}</pre>
			</section>
			<section>
				<h2 className="font-semibold mb-2">Test Results</h2>
				<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(results, null, 2)}</pre>
			</section>
			<section>
				<h2 className="font-semibold mb-2">Samples</h2>
				<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(samples, null, 2)}</pre>
			</section>
		</div>
	)
}


