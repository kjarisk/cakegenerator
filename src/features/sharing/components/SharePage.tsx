import { useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Cake,
  Clock,
  ChefHat,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CakeImage } from '@/components/CakeImage'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  useSharedConceptQuery,
  useCommentsByConceptQuery,
  useCreateCommentMutation,
  useUpdateApprovalMutation,
} from '../api/use-sharing-queries'
import { createCommentSchema, type CreateCommentInput } from '@/lib/schemas'
import type { Comment } from '@/lib/types'

export function Component() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, error } = useSharedConceptQuery(token || '')
  const { data: comments } = useCommentsByConceptQuery(data?.concept?.id || '')
  const createCommentMutation = useCreateCommentMutation()
  const approvalMutation = useUpdateApprovalMutation()

  if (isLoading) {
    return <SharedPageSkeleton />
  }

  if (error || !data?.concept) {
    return (
      <div className="min-h-svh bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <SharedHeader />
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <XCircle className="h-12 w-12 text-destructive/50" />
              <h2 className="font-display text-lg font-bold">
                Share link not found
              </h2>
              <p className="text-sm text-muted-foreground">
                This link may have expired or the concept was removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { concept, request, shareLink } = data
  const canComment = shareLink.permission === 'comment'
  const approvalStatus = request?.status || 'shared'

  const handleApprove = async () => {
    try {
      await approvalMutation.mutateAsync({
        conceptId: concept.id,
        status: 'approved',
      })
      toast.success('Concept approved!')
    } catch {
      toast.error('Failed to update approval')
    }
  }

  const handleReject = async () => {
    try {
      await approvalMutation.mutateAsync({
        conceptId: concept.id,
        status: 'rejected',
      })
      toast.success('Changes requested')
    } catch {
      toast.error('Failed to update approval')
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <SharedHeader />

        <div className="mt-6 flex flex-col gap-6">
          {/* Approval status banner */}
          <ApprovalBanner status={approvalStatus} />

          {/* Concept image */}
          <Card className="overflow-hidden">
            <CakeImage
              src={concept.image.imageUrl}
              alt={concept.title}
              className="aspect-video w-full object-cover"
            />
          </Card>

          {/* Title + tags + description */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">
                {concept.title}
              </CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {concept.themeTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {concept.description}
              </p>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-4 text-sm sm:gap-6">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{concept.recipe.timeEstimateMinutes} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{concept.recipe.ingredients.length} ingredients</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ChefHat className="h-4 w-4" />
                  <span className="capitalize">
                    {concept.recipe.difficulty}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost summary */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Estimated Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-bold text-gradient-warm">
                  ${concept.shoppingPlan.totalEstimatedCost.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ingredients
                </span>
                <span className="text-muted-foreground">+</span>
                <span className="text-lg font-bold text-gradient-warm">
                  ${concept.extras.addonsTotalEstimatedCost.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">extras</span>
              </div>
            </CardContent>
          </Card>

          {/* Approval actions */}
          {canComment && approvalStatus === 'shared' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">
                  Approval
                </CardTitle>
                <CardDescription>
                  Approve this concept or request changes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={approvalMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 shadow-glow-sm"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={approvalMutation.isPending}
                    className="hover:border-destructive/40"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Request Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                <MessageSquare className="mr-1.5 inline h-4 w-4" />
                Comments
                {comments && comments.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {comments.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {canComment
                  ? 'Leave your feedback on this cake concept.'
                  : 'Comments on this cake concept.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment list */}
              {comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentBubble key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}

              {/* Comment form */}
              {canComment && (
                <>
                  <Separator />
                  <CommentForm
                    conceptId={concept.id}
                    shareLinkId={shareLink.id}
                    onSubmit={createCommentMutation.mutateAsync}
                    isPending={createCommentMutation.isPending}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function SharedHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Cake className="h-4 w-4" />
      </div>
      <span className="font-display font-bold">CakeGen</span>
      <span className="text-muted-foreground text-sm">— Shared Concept</span>
    </div>
  )
}

function ApprovalBanner({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <span className="text-sm font-medium text-success">Approved</span>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          Changes Requested
        </span>
      </div>
    )
  }

  return null
}

function CommentBubble({ comment }: { comment: Comment }) {
  const time = new Date(comment.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{comment.authorName}</span>
        <span className="text-[11px] text-muted-foreground">{time}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {comment.message}
      </p>
    </div>
  )
}

function CommentForm({
  conceptId,
  shareLinkId,
  onSubmit,
  isPending,
}: {
  conceptId: string
  shareLinkId: string
  onSubmit: (args: {
    conceptId: string
    shareLinkId: string
    input: CreateCommentInput
  }) => Promise<unknown>
  isPending: boolean
}) {
  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      authorName: '',
      message: '',
    },
  })

  const handleSubmit = async (values: CreateCommentInput) => {
    try {
      await onSubmit({
        conceptId,
        shareLinkId,
        input: values,
      })
      form.reset()
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isPending}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {isPending ? 'Sending...' : 'Post Comment'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// --- Loading skeleton ---

function SharedPageSkeleton() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <SharedHeader />
        <div className="mt-6 flex flex-col gap-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
