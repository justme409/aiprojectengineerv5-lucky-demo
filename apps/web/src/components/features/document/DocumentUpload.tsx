"use client"
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DocumentUploadProps {
	projectId: string
}

export default function DocumentUpload({ projectId }: DocumentUploadProps) {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [open, setOpen] = useState(false)

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		setUploading(true)
		setProgress('Getting upload URLs...')

		try {
			// Get SAS URLs for files
			const response = await fetch(`/api/v1/projects/${projectId}/uploads/azure-sas`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					files: files.map(f => ({
						file_name: f.name,
						content_type: f.type,
						size: f.size
					}))
				})
			})

			if (!response.ok) throw new Error('Failed to get upload URLs')
			const { uploads } = await response.json()

			// Upload each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i]
				const upload = uploads[i]
				setProgress(`Uploading ${file.name}...`)

				const uploadResponse = await fetch(upload.uploadUrl, {
					method: 'PUT',
					headers: {
						'Content-Type': file.type,
						'x-ms-blob-type': 'BlockBlob'
					},
					body: file
				})

				if (!uploadResponse.ok) throw new Error(`Upload failed for ${file.name}`)
			}

			setProgress('Notifying server...')
			// Notify server uploads are complete
			await fetch(`/api/v1/projects/${projectId}/uploads/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ files: uploads.map((u: any) => ({ fileName: u.filename, blobName: u.blobName, contentType: files.find(f => f.name === u.filename)?.type, size: files.find(f => f.name === u.filename)?.size })) })
			})

			setProgress('Upload complete!')
			if (fileInputRef.current) fileInputRef.current.value = ''

		} catch (error) {
			console.error('Upload failed:', error)
			setProgress('Upload failed')
		} finally {
			setUploading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon" disabled={uploading} title="Upload documents">
					<Upload className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload documents</DialogTitle>
					<DialogDescription>
						Select one or more files to upload. They will be processed for content extraction and metadata.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<input
						ref={fileInputRef}
						type="file"
						multiple
						onChange={handleFileSelect}
						disabled={uploading}
					/>
					{progress && (
						<p className="text-sm text-primary">{progress}</p>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="secondary"
						onClick={() => setOpen(false)}
						disabled={uploading}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
