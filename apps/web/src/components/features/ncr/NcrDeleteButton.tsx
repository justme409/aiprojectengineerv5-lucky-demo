'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { deleteNcr } from '@/lib/actions/ncr-actions'
import { useToast } from '@/hooks/use-toast'

interface NcrDeleteButtonProps {
  ncrId: string
  projectId: string
  ncrTitle: string
  ncrNumber?: string
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  onDeleteRedirect?: string
}

export function NcrDeleteButton({
  ncrId,
  projectId,
  ncrTitle,
  ncrNumber,
  buttonVariant = 'destructive',
  onDeleteRedirect
}: NcrDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteNcr(ncrId, projectId)

      if (result.success) {
        toast({
          title: 'NCR Deleted',
          description: `NCR "${ncrTitle}" has been successfully deleted.`,
        })

        if (onDeleteRedirect) {
          router.push(onDeleteRedirect)
        } else {
          router.back()
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete NCR',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting NCR:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the NCR',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const displayName = ncrNumber ? `${ncrNumber} - ${ncrTitle}` : ncrTitle

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={buttonVariant} disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete NCR'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete NCR</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the NCR &quot;{displayName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
