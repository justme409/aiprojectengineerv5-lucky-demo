'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Camera, UploadCloud, Image as ImageIcon } from 'lucide-react'

interface PhotoItem {
  id: string
  url: string
  caption?: string
  taken_at?: string
  uploaded_at: string
  uploaded_by?: string
  location?: string
  tags?: string[]
}

export default function PhotosPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/assets?projectId=${projectId}&type=photo`)
      if (response.ok) {
        const data = await response.json()
        const assets = data.assets || []
        const mapped: PhotoItem[] = assets.map((asset: any) => ({
          id: asset.id,
          url: asset.content?.url || asset.content?.thumbnail_url || '',
          caption: asset.name,
          taken_at: asset.content?.taken_at,
          uploaded_at: asset.created_at,
          uploaded_by: asset.content?.uploaded_by,
          location: asset.content?.location,
          tags: asset.content?.tags || []
        }))
        setPhotos(mapped)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Photos</h1>
          <p className="text-gray-600 mt-2">Capture and browse site progress photos</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <UploadCloud className="w-4 h-4" />
            Upload Photos
          </button>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photos Yet</h3>
          <p className="text-gray-600 mb-6">Start by uploading your first site photos.</p>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 mx-auto">
            <UploadCloud className="w-4 h-4" />
            Upload Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {/* Thumbnail placeholder; actual image rendering can be added when URLs are public */}
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <div className="p-3 space-y-1 text-sm">
                {photo.caption && <div className="font-medium text-gray-900">{photo.caption}</div>}
                <div className="text-gray-600">
                  {photo.taken_at ? new Date(photo.taken_at).toLocaleDateString() : new Date(photo.uploaded_at).toLocaleDateString()}
                </div>
                {photo.location && <div className="text-gray-500">{photo.location}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


