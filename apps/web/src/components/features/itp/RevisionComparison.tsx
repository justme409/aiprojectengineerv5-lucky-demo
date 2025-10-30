'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RevisionComparison({ templateId, isOpen, onClose }: Props) {
  const [left, setLeft] = React.useState<any>(null)
  const [right, setRight] = React.useState<any>(null)

  React.useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    // Minimal placeholder: load latest and previous revision snapshots
    ;(async () => {
      try {
        const res = await fetch(`/api/v1/assets/${encodeURIComponent(templateId)}/revisions`, { cache: 'no-store' })
        const json = await res.json()
        const revs = json.revisions || []
        if (revs.length >= 2) {
          const [latest, prev] = [revs[0], revs[1]]
          setLeft(prev)
          setRight(latest)
        } else if (revs.length === 1) {
          setLeft(null)
          setRight(revs[0])
        }
      } catch {}
    })()
  }, [isOpen, templateId])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Compare Revisions</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h4 className="font-semibold mb-2">Previous</h4>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(left, null, 2)}</pre>
          </div>
          <div className="border rounded p-3">
            <h4 className="font-semibold mb-2">Current</h4>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(right, null, 2)}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


