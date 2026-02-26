import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Calendar,
  Plus,
  Trash2,
  UserPlus,
  ChefHat,
  CalendarDays,
  LayoutList,
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
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  useBonanzaSchedulesQuery,
  useUsersQuery,
  useCreateBonanzaScheduleMutation,
  useDeleteBonanzaScheduleMutation,
  useAddAssignmentMutation,
  useRemoveAssignmentMutation,
  useRateAssignmentMutation,
  useCreateUserMutation,
} from '../api/use-bonanza-queries'
import { useBonanzaStore } from '../state/bonanza-store'
import {
  createBonanzaScheduleSchema,
  type CreateBonanzaScheduleInput,
} from '@/lib/schemas'
import { CalendarView } from './CalendarView'
import { StarRating } from './StarRating'
import type { BonanzaSchedule, BonanzaAssignment, User } from '@/lib/types'

export function Component() {
  const {
    isCreateScheduleOpen,
    setCreateScheduleOpen,
    isAddAssignmentOpen,
    setAddAssignmentOpen,
    viewMode,
    setViewMode,
  } = useBonanzaStore()

  const { data: schedules, isLoading } = useBonanzaSchedulesQuery()
  const { data: users } = useUsersQuery()
  const deleteMutation = useDeleteBonanzaScheduleMutation()
  const removeAssignmentMutation = useRemoveAssignmentMutation()
  const rateAssignmentMutation = useRateAssignmentMutation()

  const activeSchedule = schedules?.[0]

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Schedule deleted')
    } catch {
      toast.error('Failed to delete schedule')
    }
  }

  const handleRemoveAssignment = async (
    scheduleId: string,
    weekStartDate: string
  ) => {
    try {
      await removeAssignmentMutation.mutateAsync({ scheduleId, weekStartDate })
      toast.success('Assignment removed')
    } catch {
      toast.error('Failed to remove assignment')
    }
  }

  const handleRateAssignment = async (
    scheduleId: string,
    weekStartDate: string,
    rating: number
  ) => {
    try {
      await rateAssignmentMutation.mutateAsync({
        scheduleId,
        weekStartDate,
        rating,
      })
      toast.success(rating > 0 ? `Rated ${rating}/5 stars` : 'Rating cleared')
    } catch {
      toast.error('Failed to rate cake')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-chart-4" />
            <h1 className="text-2xl font-bold tracking-tight">
              Weekly Cake Bonanza
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your team&apos;s weekly cake schedule and assignments.
          </p>
        </div>
        {!activeSchedule && (
          <Button onClick={() => setCreateScheduleOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Schedule
          </Button>
        )}
        {activeSchedule && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('calendar')}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Calendar view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : activeSchedule ? (
        <ScheduleView
          schedule={activeSchedule}
          users={users || []}
          viewMode={viewMode}
          onDelete={() => handleDeleteSchedule(activeSchedule.id)}
          onRemoveAssignment={(weekStartDate) =>
            handleRemoveAssignment(activeSchedule.id, weekStartDate)
          }
          onRateAssignment={(weekStartDate, rating) =>
            handleRateAssignment(activeSchedule.id, weekStartDate, rating)
          }
          onAddAssignment={() => setAddAssignmentOpen(true)}
        />
      ) : (
        <EmptyState onCreateClick={() => setCreateScheduleOpen(true)} />
      )}

      {/* Create schedule dialog */}
      <CreateScheduleDialog
        open={isCreateScheduleOpen}
        onOpenChange={setCreateScheduleOpen}
      />

      {/* Add assignment dialog */}
      {activeSchedule && (
        <AddAssignmentDialog
          open={isAddAssignmentOpen}
          onOpenChange={setAddAssignmentOpen}
          scheduleId={activeSchedule.id}
          existingAssignments={activeSchedule.assignments}
          users={users || []}
        />
      )}
    </div>
  )
}

// --- Sub-components ---

function ScheduleView({
  schedule,
  users,
  viewMode,
  onDelete,
  onRemoveAssignment,
  onRateAssignment,
  onAddAssignment,
}: {
  schedule: BonanzaSchedule
  users: User[]
  viewMode: 'list' | 'calendar'
  onDelete: () => void
  onRemoveAssignment: (weekStartDate: string) => void
  onRateAssignment: (weekStartDate: string, rating: number) => void
  onAddAssignment: () => void
}) {
  const userMap = new Map(users.map((u) => [u.id, u]))
  const now = new Date()

  return (
    <div className="space-y-4">
      {/* Schedule info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{schedule.teamName}</CardTitle>
              <CardDescription>
                Started {new Date(schedule.startDate).toLocaleDateString()} —
                Weekly cadence
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onAddAssignment}>
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Assign Week
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assignments — calendar or list view */}
      {viewMode === 'calendar' ? (
        <CalendarView
          assignments={schedule.assignments}
          users={users}
          onRemoveAssignment={onRemoveAssignment}
          onRateAssignment={onRateAssignment}
          onAddAssignment={onAddAssignment}
        />
      ) : schedule.assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="font-medium">No assignments yet</p>
              <p className="text-sm text-muted-foreground">
                Assign team members to weeks to get started.
              </p>
            </div>
            <Button size="sm" onClick={onAddAssignment}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Assign First Week
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {schedule.assignments.map((assignment) => {
            const weekDate = new Date(assignment.weekStartDate)
            const isCurrentWeek = isThisWeek(weekDate, now)
            const isPast = weekDate < now && !isCurrentWeek
            const user = userMap.get(assignment.userId)

            return (
              <Card
                key={assignment.weekStartDate}
                className={isCurrentWeek ? 'border-accent/50 bg-accent/5' : ''}
              >
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Week of{' '}
                        {weekDate.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {isCurrentWeek && (
                        <Badge className="bg-accent text-accent-foreground text-[10px]">
                          This Week
                        </Badge>
                      )}
                      {isPast && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground"
                        >
                          Past
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ChefHat className="h-3.5 w-3.5" />
                      <span>{user?.displayName || 'Unknown user'}</span>
                    </div>
                    {(isPast || isCurrentWeek) && (
                      <div className="mt-1">
                        <StarRating
                          value={assignment.rating}
                          onChange={(rating) =>
                            onRateAssignment(assignment.weekStartDate, rating)
                          }
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => onRemoveAssignment(assignment.weekStartDate)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="text-lg font-medium">No bonanza schedule yet</p>
          <p className="text-sm text-muted-foreground">
            Create a weekly schedule to assign team members to bake each week.
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Schedule
        </Button>
      </CardContent>
    </Card>
  )
}

// --- Dialogs ---

function CreateScheduleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreateBonanzaScheduleMutation()

  const form = useForm<CreateBonanzaScheduleInput>({
    resolver: zodResolver(createBonanzaScheduleSchema),
    defaultValues: {
      teamName: '',
      startDate: new Date().toISOString().split('T')[0],
      cadence: 'weekly',
    },
  })

  const onSubmit = async (values: CreateBonanzaScheduleInput) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success('Schedule created!')
      form.reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to create schedule')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Bonanza Schedule</DialogTitle>
          <DialogDescription>
            Set up a weekly cake schedule for your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Engineering Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function AddAssignmentDialog({
  open,
  onOpenChange,
  scheduleId,
  users,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  existingAssignments: BonanzaAssignment[]
  users: User[]
}) {
  const [weekStartDate, setWeekStartDate] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newUserName, setNewUserName] = useState('')

  const addAssignmentMutation = useAddAssignmentMutation()
  const createUserMutation = useCreateUserMutation()

  const handleSubmit = async () => {
    if (!weekStartDate) {
      toast.error('Please select a week')
      return
    }

    let userId = selectedUserId

    // Create new user if needed
    if (!userId && newUserName.trim()) {
      try {
        const user = await createUserMutation.mutateAsync({
          displayName: newUserName.trim(),
        })
        userId = user.id
      } catch {
        toast.error('Failed to create user')
        return
      }
    }

    if (!userId) {
      toast.error('Please select or create a team member')
      return
    }

    try {
      await addAssignmentMutation.mutateAsync({
        scheduleId,
        assignment: {
          weekStartDate,
          userId,
        },
      })
      toast.success('Week assigned!')
      setWeekStartDate('')
      setSelectedUserId('')
      setNewUserName('')
      onOpenChange(false)
    } catch {
      toast.error('Failed to assign week')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign a Week</DialogTitle>
          <DialogDescription>
            Pick a week and assign a team member to bake.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Week Starting</label>
            <Input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">Team Member</label>
            {users.length > 0 && (
              <Select
                value={selectedUserId}
                onValueChange={(v) => {
                  setSelectedUserId(v)
                  setNewUserName('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select existing member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>or add a new member:</span>
            </div>
            <Input
              placeholder="New member name"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value)
                if (e.target.value) setSelectedUserId('')
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              addAssignmentMutation.isPending || createUserMutation.isPending
            }
          >
            {addAssignmentMutation.isPending ? 'Assigning...' : 'Assign Week'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Helpers ---

function isThisWeek(date: Date, now: Date): boolean {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  return date >= startOfWeek && date < endOfWeek
}
