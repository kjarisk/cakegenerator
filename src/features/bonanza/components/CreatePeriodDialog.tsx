// =============================================================================
// CreatePeriodDialog — Bulk period creation
// Picks date range (start → end), generates all empty weeks.
// Bakers are assigned later from the calendar.
// =============================================================================

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarRange } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'

import { useCreateBonanzaPeriodMutation } from '../api/use-bonanza-queries'
import {
  createBonanzaPeriodSchema,
  type CreateBonanzaPeriodInput,
} from '@/lib/schemas'

interface CreatePeriodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Compute how many weeks a date range covers. */
function countWeeks(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (end <= start) return 0
  const diffMs = end.getTime() - start.getTime()
  return Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))
}

/** Suggest a period name from the date range. */
function suggestPeriodName(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const startMonth = start.toLocaleDateString(undefined, { month: 'short' })
  const endMonth = end.toLocaleDateString(undefined, { month: 'short' })
  const year = end.getFullYear()
  if (startMonth === endMonth) {
    return `${startMonth} ${year}`
  }
  return `${startMonth}–${endMonth} ${year}`
}

export function CreatePeriodDialog({
  open,
  onOpenChange,
}: CreatePeriodDialogProps) {
  const createMutation = useCreateBonanzaPeriodMutation()

  // Default: start next Monday, end 12 weeks later
  const nextMonday = getNextMonday()
  const defaultEnd = new Date(nextMonday)
  defaultEnd.setDate(defaultEnd.getDate() + 12 * 7 - 1) // 12 weeks

  const form = useForm<CreateBonanzaPeriodInput>({
    resolver: zodResolver(createBonanzaPeriodSchema),
    defaultValues: {
      teamName: '',
      startDate: formatDate(nextMonday),
      endDate: formatDate(defaultEnd),
    },
  })

  const watchStart = form.watch('startDate')
  const watchEnd = form.watch('endDate')
  const weekCount = countWeeks(watchStart, watchEnd)
  const suggestedName = suggestPeriodName(watchStart, watchEnd)

  const onSubmit = async (values: CreateBonanzaPeriodInput) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success(`Period created with ${weekCount} weeks!`)
      form.reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to create period')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-warm" />
            Create New Period
          </DialogTitle>
          <DialogDescription>
            Set a date range for the new cake bonanza period. All weeks will be
            generated — assign bakers afterwards from the calendar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={suggestedName || 'e.g., Spring 2026'}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {suggestedName && !field.value && (
                      <button
                        type="button"
                        className="text-xs text-primary underline-offset-2 hover:underline"
                        onClick={() => form.setValue('teamName', suggestedName)}
                      >
                        Use suggestion: {suggestedName}
                      </button>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {weekCount > 0 && (
              <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                This will generate{' '}
                <span className="font-bold text-warm">{weekCount} weeks</span>{' '}
                of cake assignments.
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? 'Creating...'
                  : `Create Period (${weekCount} weeks)`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// --- Helpers ---

function getNextMonday(): Date {
  const now = new Date()
  const day = now.getDay()
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + daysUntilMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
