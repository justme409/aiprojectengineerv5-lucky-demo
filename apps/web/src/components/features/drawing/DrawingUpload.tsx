"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { UploadCloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface DrawingUploadProps {
	projectId: string
}

export default function DrawingUpload({ projectId }: DrawingUploadProps) {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState('')
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [drawingNumber, setDrawingNumber] = useState('')
	const [revision, setRevision] = useState('A')
	const [drawingType, setDrawingType] = useState('General Arrangement')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const DRAWING_TYPES = [
		'General Arrangement',
		'Section',
		'Elevation',
		'Detail',
		'Plan',
		'Schedule',
		'Diagram',
		'Layout'
	]

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 1) {
			const file = files[0]
			setSelectedFile(file)

			// Try to extract drawing number from filename if not set
			if (!drawingNumber) {
				const fileName = file.name.toLowerCase()
				// Look for patterns like "DWG-001", "DR-123", etc.
				const drawingMatch = fileName.match(/(?:dwg|dr|drawing)[-_]?(\d+)/i)
				if (drawingMatch) {
					setDrawingNumber(drawingMatch[1])
				}
			}
		}
	}

	const handleUpload = async () => {
		if (!selectedFile) {
			toast.error('Please select a drawing file to upload')
			return
		}

		if (!drawingNumber.trim()) {
			toast.error('Please enter a drawing number')
			return
		}

		setUploading(true)
		setProgress('Getting upload URLs...')

		try {
			// Get SAS URL for the file
			const response = await fetch(`/api/v1/projects/${projectId}/uploads/azure-sas`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					files: [{
						file_name: selectedFile.name,
						content_type: selectedFile.type,
						size: selectedFile.size
					}]
				})
			})

			if (!response.ok) throw new Error('Failed to get upload URL')
			const { uploads } = await response.json()

			// Upload the file
			const upload = uploads[0]
			setProgress(`Uploading ${selectedFile.name}...`)

			const uploadResponse = await fetch(upload.uploadUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': selectedFile.type,
					'x-ms-blob-type': 'BlockBlob'
				},
				body: selectedFile
			})

			if (!uploadResponse.ok) throw new Error(`Upload failed for ${selectedFile.name}`)

			setProgress('Processing drawing...')

			// Notify server about the completed upload and trigger drawing processing
			const completeResponse = await fetch(`/api/v1/projects/${projectId}/uploads/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					files: [{
						fileName: selectedFile.name,
						blobName: upload.blobName,
						contentType: selectedFile.type,
						size: selectedFile.size
					}],
					metadata: {
						type: 'drawing',
						subtype: drawingType,
						document_number: drawingNumber,
						revision_code: revision,
						is_drawing: true
					}
				})
			})

			if (!completeResponse.ok) throw new Error('Failed to process drawing')

			setProgress('Drawing uploaded and processed successfully!')
			toast.success('Drawing uploaded successfully!')

			// Reset form
			setSelectedFile(null)
			setDrawingNumber('')
			setRevision('A')
			setDrawingType('General Arrangement')
			if (fileInputRef.current) fileInputRef.current.value = ''

		} catch (error) {
			console.error('Upload failed:', error)
			setProgress('Upload failed')
			toast.error('Failed to upload drawing')
		} finally {
			setUploading(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload New Drawing</CardTitle>
				<CardDescription>
					Upload a drawing file with metadata for proper categorization and revision tracking
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label htmlFor="drawing-file" className="text-sm font-medium">Drawing File</Label>
					<div className="mt-2">
						<Input
							id="drawing-file"
							type="file"
							ref={fileInputRef}
							onChange={handleFileSelect}
							accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
							disabled={uploading}
							className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-primary hover:file:bg-muted file:cursor-pointer cursor-pointer"
						/>
						{selectedFile && (
							<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
								<p className="text-sm text-green-700 flex items-center">
									<CheckCircle className="mr-2 h-4 w-4" />
									Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<Label htmlFor="drawing-number" className="text-sm font-medium">Drawing Number</Label>
						<Input
							id="drawing-number"
							type="text"
							value={drawingNumber}
							onChange={(e) => setDrawingNumber(e.target.value)}
							placeholder="e.g., DWG-001"
							className="mt-2"
							disabled={uploading}
						/>
					</div>

					<div>
						<Label htmlFor="revision" className="text-sm font-medium">Revision</Label>
						<Input
							id="revision"
							type="text"
							value={revision}
							onChange={(e) => setRevision(e.target.value)}
							placeholder="e.g., A, B, C"
							className="mt-2"
							disabled={uploading}
						/>
					</div>

					<div>
						<Label htmlFor="drawing-type" className="text-sm font-medium">Drawing Type</Label>
						<select
							id="drawing-type"
							value={drawingType}
							onChange={(e) => setDrawingType(e.target.value)}
							className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							disabled={uploading}
						>
							{DRAWING_TYPES.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex gap-2 pt-2">
					<Button
						onClick={handleUpload}
						disabled={uploading || !selectedFile || !drawingNumber.trim()}
						className="flex-1 bg-primary hover:bg-primary/90 text-white"
					>
						{uploading ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<UploadCloud className="mr-2 h-4 w-4" />
						)}
						{uploading ? 'Uploading...' : 'Upload Drawing'}
					</Button>
				</div>

				{progress && (
					<div className={`mt-3 flex items-center gap-x-2 rounded-md p-3 text-sm ${
						progress.includes('failed') || progress.includes('error')
							? 'bg-red-500/10 text-red-700 border border-red-500/50'
							: progress.includes('success')
							? 'bg-green-500/10 text-green-700 border border-green-500/50'
							: 'bg-primary/10 text-primary border border-primary/50'
					}`}>
						{progress.includes('failed') || progress.includes('error') ? (
							<AlertTriangle className="h-4 w-4 flex-shrink-0" />
						) : progress.includes('success') ? (
							<CheckCircle className="h-4 w-4 flex-shrink-0" />
						) : (
							<Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
						)}
						<p>{progress}</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
