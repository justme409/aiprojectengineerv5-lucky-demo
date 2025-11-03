'use client';

import { useState } from 'react';
import { PhotoNode } from '@/schemas/neo4j';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Image as ImageIcon, MapPin, Calendar } from 'lucide-react';

interface PhotosGalleryProps {
  photos: PhotoNode[];
  projectId: string;
}

export function PhotosGallery({ photos, projectId }: PhotosGalleryProps) {
  const [search, setSearch] = useState('');
  
  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch = 
      (photo.description && photo.description.toLowerCase().includes(search.toLowerCase())) ||
      (photo.location && photo.location.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search photos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No photos found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                {photo.fileUrl ? (
                  <img
                    src={photo.fileUrl}
                    alt={photo.description || 'Project photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="p-3 space-y-2">
                {photo.description && (
                  <p className="text-sm font-medium line-clamp-2">
                    {photo.description}
                  </p>
                )}
                {photo.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {photo.location}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(photo.date), 'dd MMM yyyy')}
                </div>
                {photo.takenBy && (
                  <div className="text-xs text-muted-foreground">
                    By: {photo.takenBy}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredPhotos.length} of {photos.length} photos
      </div>
    </div>
  );
}

