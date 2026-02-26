import { useState } from 'react'
import { Copy, Check, Link2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  useCreateShareLinkMutation,
  useShareLinksByConceptQuery,
} from '../api/use-sharing-queries'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conceptId: string
}

export function ShareDialog({
  open,
  onOpenChange,
  conceptId,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { data: existingLinks } = useShareLinksByConceptQuery(conceptId)
  const createMutation = useCreateShareLinkMutation()

  const existingLink = existingLinks?.[0]
  const shareUrl = existingLink
    ? `${window.location.origin}/share/${existingLink.token}`
    : null

  const handleCreate = async () => {
    try {
      const link = await createMutation.mutateAsync({
        conceptId,
        permission: 'comment',
      })
      toast.success('Share link created!')
      // Copy to clipboard automatically
      const url = `${window.location.origin}/share/${link.token}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to create share link')
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Concept</DialogTitle>
          <DialogDescription>
            Generate a shareable link for stakeholders to review and comment.
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="space-y-3">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the concept and leave comments.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <Link2 className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground text-center">
              Create a share link so stakeholders can view this concept, leave
              comments, and approve or request changes.
            </p>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
