import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Tag } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  useThemeCategoriesQuery,
  useSaveConceptToBankMutation,
} from '../api/use-cake-bank-queries'
import { CreateCategoryDialog } from './CreateCategoryDialog'

const saveToBankSchema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  tags: z.string(),
  notes: z.string().max(500, 'Max 500 characters'),
})

type SaveToBankInput = z.infer<typeof saveToBankSchema>

interface SaveToBankDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conceptId: string
  existingTags?: string[]
  existingNotes?: string
}

export function SaveToBankDialog({
  open,
  onOpenChange,
  conceptId,
  existingTags = [],
  existingNotes = '',
}: SaveToBankDialogProps) {
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const { data: categories } = useThemeCategoriesQuery()
  const saveMutation = useSaveConceptToBankMutation()

  const form = useForm<SaveToBankInput>({
    resolver: zodResolver(saveToBankSchema),
    defaultValues: {
      categoryId: '',
      tags: existingTags.join(', '),
      notes: existingNotes,
    },
  })

  const onSubmit = async (values: SaveToBankInput) => {
    const tags = values.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await saveMutation.mutateAsync({
        conceptId,
        categoryId: values.categoryId,
        tags: tags.length > 0 ? tags : undefined,
        notes: values.notes || undefined,
      })
      toast.success('Saved to Cake Bank!')
      form.reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to save concept')
    }
  }

  const handleCategoryCreated = (id: string) => {
    form.setValue('categoryId', id)
    setShowCreateCategory(false)
  }

  // Parse current tags for preview
  const tagsValue = form.watch('tags') // eslint-disable-line react-hooks/incompatible-library
  const tagPreview = tagsValue
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Save to Cake Bank</DialogTitle>
            <DialogDescription>
              Choose a theme category and add tags to organize this concept.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Category picker */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Category</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                          {(!categories || categories.length === 0) && (
                            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                              No categories yet
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCreateCategory(true)}
                        aria-label="Create new category"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., fondant, kid-friendly, chilled"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated tags for easier searching.
                    </FormDescription>
                    {tagPreview.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tagPreview.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] px-1.5"
                          >
                            <Tag className="mr-1 h-2.5 w-2.5" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any tips or notes about this cake..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal notes, not visible on share links.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-accent hover:bg-accent/90"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save to Bank'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Nested create category dialog */}
      <CreateCategoryDialog
        open={showCreateCategory}
        onOpenChange={setShowCreateCategory}
        onCreated={handleCategoryCreated}
      />
    </>
  )
}
