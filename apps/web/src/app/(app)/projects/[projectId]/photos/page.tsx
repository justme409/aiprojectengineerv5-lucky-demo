import { Suspense } from 'react';
import { PhotoNode, PHOTO_QUERIES } from '@/schemas/neo4j/photo.schema';
import { neo4jClient } from '@/lib/neo4j';
import { PhotosGallery } from '@/components/photos/photos-gallery';
import { PhotosGallerySkeleton } from '@/components/photos/photos-gallery-skeleton';
import { UploadPhotoButton } from '@/components/photos/upload-photo-button';

/**
 * Photos Page
 * 
 * Displays all photos for a project in a gallery view.
 * Photos can be linked to lots, NCRs, inspections, and other items.
 */

interface PageProps {
  params: Promise<{ projectId: string }>;
}

async function getPhotos(projectId: string): Promise<PhotoNode[]> {
  try {
    return await neo4jClient.read<PhotoNode>(
      PHOTO_QUERIES.getAllPhotos,
      { projectId }
    );
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to fetch photos');
  }
}

async function PhotosContent({ projectId }: { projectId: string }) {
  const photos = await getPhotos(projectId);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
          <p className="text-muted-foreground mt-2">
            Project photos linked to lots, inspections, and quality records
          </p>
        </div>
        <UploadPhotoButton projectId={projectId} />
      </div>
      
      <PhotosGallery photos={photos} projectId={projectId} />
      
      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No photos found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload photos to document project progress
          </p>
        </div>
      )}
    </div>
  );
}

export default async function PhotosPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<PhotosGallerySkeleton />}>
        <PhotosContent projectId={projectId} />
      </Suspense>
    </div>
  );
}

