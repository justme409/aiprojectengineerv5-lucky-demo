'use client'

import { useEffect, useState } from 'react'

export function ProjectInbox({ projectId }: { projectId: string }) {
	const [threads, setThreads] = useState<any[]>([])
	const [selected, setSelected] = useState<string | null>(null)
	const [messages, setMessages] = useState<any[]>([])

	useEffect(() => {
		const load = async () => {
			const res = await fetch('/api/v1/email/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_threads', project_id: projectId }) })
			const json = await res.json()
			setThreads(json.threads || [])
		}
		load()
	}, [projectId])

	useEffect(() => {
		if (!selected) return
		const load = async () => {
			const res = await fetch('/api/v1/email/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_thread_messages', project_id: projectId, thread_key: selected }) })
			const json = await res.json()
			setMessages(json.messages || [])
		}
		load()
	}, [selected, projectId])

	return (
		<div className="grid grid-cols-3 gap-4">
			<div className="col-span-1 border rounded p-2">
				<h2 className="font-semibold mb-2">Threads</h2>
				<ul className="space-y-1">
					{threads.map(t => (
						<li key={t.thread_key}>
							<button className={`w-full text-left px-2 py-1 rounded ${selected === t.thread_key ? 'bg-gray-200' : ''}`} onClick={() => setSelected(t.thread_key)}>
								{t.thread_key}
							</button>
						</li>
					))}
				</ul>
			</div>
			<div className="col-span-2 border rounded p-2">
				<h2 className="font-semibold mb-2">Messages</h2>
				<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(messages, null, 2)}</pre>
			</div>
		</div>
	)
}
