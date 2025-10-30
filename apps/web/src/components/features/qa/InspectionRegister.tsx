"use client"
import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface InspectionRegisterProps {
	projectId: string
}

interface IRFormData {
	checkpoint_id: string
	name: string
	description: string
	sla_hours: number
	scheduled_at: string
	lot_asset_id: string
	wbs_node_asset_id: string
	lbs_node_asset_id: string
}

export default function InspectionRegister({ projectId }: InspectionRegisterProps) {
	const { data, mutate } = useSWR(`/api/v1/inspections?project_id=${projectId}`, fetcher)
	const inspections = data?.data || []

	const [filter, setFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [formData, setFormData] = useState<IRFormData>({
		checkpoint_id: '',
		name: '',
		description: '',
		sla_hours: 24,
		scheduled_at: '',
		lot_asset_id: '',
		wbs_node_asset_id: '',
		lbs_node_asset_id: ''
	})

	const filteredInspections = inspections.filter((ir: any) => {
		const matchesText = ir.content?.checkpoint_id?.toLowerCase().includes(filter.toLowerCase()) ||
		                   ir.name?.toLowerCase().includes(filter.toLowerCase())
		const matchesStatus = statusFilter === 'all' || ir.approval_state === statusFilter
		return matchesText && matchesStatus
	})

	const handleCreateIR = () => {
		setShowCreateModal(true)
	}

	const handleSubmitIR = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const irData = {
				type: 'inspection_request',
				name: formData.name,
				project_id: projectId,
				content: {
					checkpoint_id: formData.checkpoint_id,
					description: formData.description,
					sla_hours: formData.sla_hours,
					sla_due_at: formData.scheduled_at ? new Date(new Date(formData.scheduled_at).getTime() + (formData.sla_hours * 60 * 60 * 1000)).toISOString() : null,
					scheduled_at: formData.scheduled_at || null,
					lot_asset_id: formData.lot_asset_id || null,
					wbs_node_asset_id: formData.wbs_node_asset_id || null,
					lbs_node_asset_id: formData.lbs_node_asset_id || null
				}
			}

			const response = await fetch('/api/v1/assets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					asset: irData,
					idempotency_key: `ir:${formData.checkpoint_id}:${Date.now()}`
				})
			})

			if (response.ok) {
				mutate() // Refresh the data
				setShowCreateModal(false)
				setFormData({
					checkpoint_id: '',
					name: '',
					description: '',
					sla_hours: 24,
					scheduled_at: '',
					lot_asset_id: '',
					wbs_node_asset_id: '',
					lbs_node_asset_id: ''
				})
			}
		} catch (error) {
			console.error('Error creating IR:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleInputChange = (field: keyof IRFormData, value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<div className="flex gap-4">
					<input
						type="text"
						placeholder="Filter inspections..."
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="px-3 py-2 border rounded"
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-3 py-2 border rounded"
					>
						<option value="all">All Status</option>
						<option value="draft">Draft</option>
						<option value="pending_review">Pending Review</option>
						<option value="approved">Approved</option>
					</select>
				</div>
				<button
					onClick={handleCreateIR}
					className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
				>
					Create IR
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full bg-white border">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left">Checkpoint ID</th>
							<th className="px-4 py-2 text-left">Name</th>
							<th className="px-4 py-2 text-left">Status</th>
							<th className="px-4 py-2 text-left">SLA Due</th>
							<th className="px-4 py-2 text-left">Scheduled</th>
							<th className="px-4 py-2 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredInspections.map((ir: any) => (
							<tr key={ir.id} className="border-t">
								<td className="px-4 py-2">{ir.content?.checkpoint_id}</td>
								<td className="px-4 py-2">{ir.name}</td>
								<td className="px-4 py-2">
									<span className={`px-2 py-1 rounded text-xs ${
										ir.approval_state === 'approved' ? 'bg-green-100 text-green-800' :
										ir.approval_state === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{ir.approval_state}
									</span>
								</td>
								<td className="px-4 py-2">
									{ir.content?.sla_due_at ? new Date(ir.content.sla_due_at).toLocaleDateString() : 'N/A'}
								</td>
								<td className="px-4 py-2">
									{ir.content?.scheduled_at ? new Date(ir.content.scheduled_at).toLocaleDateString() : 'Not scheduled'}
								</td>
								<td className="px-4 py-2">
									<button className="text-primary hover:text-foreground text-sm">
										View Details
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredInspections.length === 0 && (
				<div className="text-center py-8 text-gray-500">
					No inspection requests found. Create inspection requests for quality checkpoints.
				</div>
			)}

			{/* Create IR Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold text-gray-900">
									Create Inspection Request
								</h2>
								<button
									onClick={() => setShowCreateModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									✕
								</button>
							</div>
						</div>

						<form onSubmit={handleSubmitIR} className="p-6 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Checkpoint ID *
									</label>
									<input
										type="text"
										required
										value={formData.checkpoint_id}
										onChange={(e) => handleInputChange('checkpoint_id', e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
										placeholder="e.g., IR-001"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										SLA Hours
									</label>
									<input
										type="number"
										value={formData.sla_hours}
										onChange={(e) => handleInputChange('sla_hours', parseInt(e.target.value))}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
										min="1"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Request Name *
								</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Inspection request title"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									value={formData.description}
									onChange={(e) => handleInputChange('description', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
									rows={3}
									placeholder="Describe the inspection requirements"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Scheduled Date/Time
								</label>
								<input
									type="datetime-local"
									value={formData.scheduled_at}
									onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Lot Asset ID
									</label>
									<input
										type="text"
										value={formData.lot_asset_id}
										onChange={(e) => handleInputChange('lot_asset_id', e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
										placeholder="UUID of related lot"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										WBS Node ID
									</label>
									<input
										type="text"
										value={formData.wbs_node_asset_id}
										onChange={(e) => handleInputChange('wbs_node_asset_id', e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
										placeholder="UUID of WBS node"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										LBS Node ID
									</label>
									<input
										type="text"
										value={formData.lbs_node_asset_id}
										onChange={(e) => handleInputChange('lbs_node_asset_id', e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
										placeholder="UUID of LBS node"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t">
								<button
									type="button"
									onClick={() => setShowCreateModal(false)}
									className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
									disabled={isSubmitting}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
									disabled={isSubmitting}
								>
									{isSubmitting ? 'Creating...' : 'Create Inspection Request'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
