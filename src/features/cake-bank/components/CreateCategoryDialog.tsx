import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  createThemeCategorySchema,
  type CreateThemeCategoryInput,
} from '@/lib/schemas'
import { useCreateThemeCategoryMutation } from '../api/use-cake-bank-queries'

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (id: string) => void
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCategoryDialogProps) {
  const createMutation = useCreateThemeCategoryMutation()

  const form = useForm<CreateThemeCategoryInput>({
    resolver: zodResolver(createThemeCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = async (values: CreateThemeCategoryInput) => {
    try {
      const category = await createMutation.mutateAsync(values)
      toast.success(`Category "${values.name}" created`)
      form.reset()
      onOpenChange(false)
      onCreated?.(category.id)
    } catch {
      toast.error('Failed to create category')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Theme Category</DialogTitle>
          <DialogDescription>
            Organize your saved cakes under themed categories.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Space, Retro 80s, Halloween"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What kind of cakes belong in this category?"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
