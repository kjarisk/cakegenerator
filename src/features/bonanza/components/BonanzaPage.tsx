import { useMemo } from 'react'
import {
  Calendar,
  Plus,
  Trash2,
  ChefHat,
  CalendarDays,
  LayoutList,
  Archive,
  ChevronDown,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  useBonanzaSchedulesQuery,
  useUsersQuery,
  useDeleteBonanzaScheduleMutation,
  useRemoveAssignmentMutation,
  useRateAssignmentMutation,
  useCompletePeriodMutation,
  getActivePeriod,
  getArchivedPeriods,
} from '../api/use-bonanza-queries'
import { useBonanzaStore } from '../state/bonanza-store'
import { CalendarView } from './CalendarView'
import { StarRating } from './StarRating'
import { HypeBanner } from './HypeBanner'
import { CreatePeriodDialog } from './CreatePeriodDialog'
import { AssignBakerDialog } from './AssignBakerDialog'
import type { BonanzaSchedule, User, DayOfWeek } from '@/lib/types'
import { DAY_NAMES } from '@/lib/types'

// --- Helpers ---

/** Get the Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function isCurrentWeek(weekStartDate: string): boolean {
  const now = new Date()
  const thisMonday = getMonday(now)
  const weekMonday = getMonday(new Date(weekStartDate + 'T00:00:00'))
  return thisMonday.getTime() === weekMonday.getTime()
}

// --- Main Component ---

export function Component() {
  const {
    isCreatePeriodOpen,
    setCreatePeriodOpen,
    isAssignBakerOpen,
    assignBakerWeek,
    openAssignBaker,
    closeAssignBaker,
    viewingArchiveId,
    setViewingArchiveId,
    viewMode,
    setViewMode,
  } = useBonanzaStore()

  const { data: schedules, isLoading } = useBonanzaSchedulesQuery()
  const { data: users } = useUsersQuery()
  const deleteMutation = useDeleteBonanzaScheduleMutation()
  const removeAssignmentMutation = useRemoveAssignmentMutation()
  const rateAssignmentMutation = useRateAssignmentMutation()
  const completePeriodMutation = useCompletePeriodMutation()

  const activePeriod = useMemo(() => getActivePeriod(schedules), [schedules])
  const archivedPeriods = useMemo(
    () => getArchivedPeriods(schedules),
    [schedules]
  )

  // Determine which period to display
  const viewingArchive = viewingArchiveId
    ? schedules?.find((s) => s.id === viewingArchiveId)
    : null
  const displayedPeriod = viewingArchive || activePeriod
  const isViewingArchive = !!viewingArchive

  // Find this week's assignment (from active period only)
  const thisWeekAssignment = useMemo(() => {
    if (!activePeriod) return null
    return (
      activePeriod.assignments.find(
        (a) => a.userId && isCurrentWeek(a.weekStartDate)
      ) || null
    )
  }, [activePeriod])

  const userMap = useMemo(
    () => new Map((users || []).map((u) => [u.id, u])),
    [users]
  )

  const handleDeletePeriod = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      if (viewingArchiveId === id) setViewingArchiveId(null)
      toast.success('Period deleted')
    } catch {
      toast.error('Failed to delete period')
    }
  }

  const handleRemoveAssignment = async (
    scheduleId: string,
    weekStartDate: string
  ) => {
    try {
      await removeAssignmentMutation.mutateAsync({ scheduleId, weekStartDate })
      toast.success('Baker unassigned')
    } catch {
      toast.error('Failed to unassign baker')
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

  const handleCompletePeriod = async (id: string) => {
    try {
      await completePeriodMutation.mutateAsync(id)
      toast.success('Period archived')
    } catch {
      toast.error('Failed to archive period')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-chart-4" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Weekly Cake Bonanza
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your team&apos;s weekly cake schedule and assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Archive picker */}
          {archivedPeriods.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Archive className="mr-1.5 h-3.5 w-3.5" />
                  {isViewingArchive ? viewingArchive!.teamName : 'Archives'}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Past Periods</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isViewingArchive && (
                  <DropdownMenuItem onClick={() => setViewingArchiveId(null)}>
                    <span className="font-medium text-primary">
                      Back to Active Period
                    </span>
                  </DropdownMenuItem>
                )}
                {archivedPeriods.map((period) => (
                  <DropdownMenuItem
                    key={period.id}
                    onClick={() => setViewingArchiveId(period.id)}
                    className={
                      viewingArchiveId === period.id
                        ? 'bg-muted font-medium'
                        : ''
                    }
                  >
                    <div className="flex flex-col">
                      <span>{period.teamName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(period.startDate).toLocaleDateString(
                          undefined,
                          { month: 'short', year: 'numeric' }
                        )}{' '}
                        —{' '}
                        {new Date(period.endDate).toLocaleDateString(
                          undefined,
                          { month: 'short', year: 'numeric' }
                        )}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View mode toggle */}
          {displayedPeriod && (
            <div className="flex rounded-lg border border-border p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('calendar')}
                    aria-label="Calendar view"
                    aria-pressed={viewMode === 'calendar'}
                  >
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
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
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <LayoutList className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* New period button */}
          <Button size="sm" onClick={() => setCreatePeriodOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Period
          </Button>
        </div>
      </div>

      {/* Archive banner */}
      {isViewingArchive && (
        <div className="rounded-lg border border-muted bg-muted/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Viewing archived period:{' '}
              <span className="font-medium text-foreground">
                {viewingArchive!.teamName}
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingArchiveId(null)}
          >
            Back to Active
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : displayedPeriod ? (
        <>
          {/* Hype Banner — only show for active period when someone is assigned this week */}
          {!isViewingArchive && thisWeekAssignment && (
            <HypeBanner
              assignment={thisWeekAssignment}
              user={userMap.get(thisWeekAssignment.userId)}
              periodName={activePeriod!.teamName}
            />
          )}

          <PeriodView
            schedule={displayedPeriod}
            users={users || []}
            viewMode={viewMode}
            isReadOnly={isViewingArchive}
            onDelete={() => handleDeletePeriod(displayedPeriod.id)}
            onComplete={() => handleCompletePeriod(displayedPeriod.id)}
            onRemoveAssignment={(weekStartDate) =>
              handleRemoveAssignment(displayedPeriod.id, weekStartDate)
            }
            onRateAssignment={(weekStartDate, rating) =>
              handleRateAssignment(displayedPeriod.id, weekStartDate, rating)
            }
            onAssignBaker={(weekStartDate) => openAssignBaker(weekStartDate)}
          />
        </>
      ) : (
        <EmptyState onCreateClick={() => setCreatePeriodOpen(true)} />
      )}

      {/* Create period dialog */}
      <CreatePeriodDialog
        open={isCreatePeriodOpen}
        onOpenChange={setCreatePeriodOpen}
      />

      {/* Assign baker dialog */}
      {displayedPeriod && assignBakerWeek && (
        <AssignBakerDialog
          open={isAssignBakerOpen}
          onOpenChange={(open) => {
            if (!open) closeAssignBaker()
          }}
          scheduleId={displayedPeriod.id}
          weekStartDate={assignBakerWeek}
          users={users || []}
          currentUserId={
            displayedPeriod.assignments.find(
              (a) => a.weekStartDate === assignBakerWeek
            )?.userId || undefined
          }
          currentCakeDay={
            displayedPeriod.assignments.find(
              (a) => a.weekStartDate === assignBakerWeek
            )?.cakeDay
          }
          currentCakeName={
            displayedPeriod.assignments.find(
              (a) => a.weekStartDate === assignBakerWeek
            )?.cakeName
          }
        />
      )}
    </div>
  )
}

// --- Sub-components ---

function PeriodView({
  schedule,
  users,
  viewMode,
  isReadOnly,
  onDelete,
  onComplete,
  onRemoveAssignment,
  onRateAssignment,
  onAssignBaker,
}: {
  schedule: BonanzaSchedule
  users: User[]
  viewMode: 'list' | 'calendar'
  isReadOnly: boolean
  onDelete: () => void
  onComplete: () => void
  onRemoveAssignment: (weekStartDate: string) => void
  onRateAssignment: (weekStartDate: string, rating: number) => void
  onAssignBaker: (weekStartDate: string) => void
}) {
  const assignedCount = schedule.assignments.filter((a) => a.userId).length
  const totalWeeks = schedule.assignments.length

  return (
    <div className="space-y-4">
      {/* Period info card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{schedule.teamName}</CardTitle>
                <Badge
                  variant={
                    schedule.status === 'active' ? 'default' : 'secondary'
                  }
                  className={
                    schedule.status === 'active'
                      ? 'bg-success/20 text-success border-success/30'
                      : ''
                  }
                >
                  {schedule.status === 'active' ? 'Active' : 'Completed'}
                </Badge>
              </div>
              <CardDescription>
                {new Date(schedule.startDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                —{' '}
                {new Date(schedule.endDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                | {assignedCount}/{totalWeeks} weeks assigned
              </CardDescription>
            </div>
            {!isReadOnly && (
              <div className="flex gap-2">
                {schedule.status === 'active' && (
                  <Button size="sm" variant="outline" onClick={onComplete}>
                    <Archive className="mr-1.5 h-3.5 w-3.5" />
                    Archive
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive"
                  aria-label="Delete period"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            )}
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
          onAssignBaker={onAssignBaker}
          isReadOnly={isReadOnly}
        />
      ) : (
        <ListView
          schedule={schedule}
          users={users}
          isReadOnly={isReadOnly}
          onRemoveAssignment={onRemoveAssignment}
          onRateAssignment={onRateAssignment}
          onAssignBaker={onAssignBaker}
        />
      )}
    </div>
  )
}

function ListView({
  schedule,
  users,
  isReadOnly,
  onRemoveAssignment,
  onRateAssignment,
  onAssignBaker,
}: {
  schedule: BonanzaSchedule
  users: User[]
  isReadOnly: boolean
  onRemoveAssignment: (weekStartDate: string) => void
  onRateAssignment: (weekStartDate: string, rating: number) => void
  onAssignBaker: (weekStartDate: string) => void
}) {
  const userMap = new Map(users.map((u) => [u.id, u]))
  const now = new Date()

  if (schedule.assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No weeks in this period</p>
            <p className="text-sm text-muted-foreground">
              This period has no weeks generated.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {schedule.assignments.map((assignment) => {
        const weekDate = new Date(assignment.weekStartDate + 'T00:00:00')
        const thisWeek = isCurrentWeek(assignment.weekStartDate)
        const isPast = !thisWeek && weekDate < now
        const user = assignment.userId ? userMap.get(assignment.userId) : null
        const cakeDay = assignment.cakeDay ?? 5
        const isNotFriday = cakeDay !== 5

        return (
          <Card
            key={assignment.weekStartDate}
            className={thisWeek ? 'border-warm/40 bg-warm/5' : ''}
          >
            <CardContent className="flex items-center gap-4 py-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${thisWeek ? 'bg-warm/15' : 'bg-muted'}`}
              >
                <CalendarDays
                  className={`h-5 w-5 ${thisWeek ? 'text-warm' : 'text-muted-foreground'}`}
                />
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
                  {thisWeek && (
                    <Badge className="bg-warm text-warm-foreground text-[10px] shadow-glow-warm">
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
                  {isNotFriday && user && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-warm border-warm/40"
                    >
                      {DAY_NAMES[cakeDay as DayOfWeek]}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ChefHat className="h-3.5 w-3.5" />
                  <span>
                    {user?.displayName || (
                      <span className="italic opacity-60">Unassigned</span>
                    )}
                  </span>
                  {assignment.cakeName && (
                    <span className="text-xs opacity-60">
                      — {assignment.cakeName}
                    </span>
                  )}
                </div>
                {user && (isPast || thisWeek) && (
                  <div className="mt-1">
                    <StarRating
                      value={assignment.rating}
                      onChange={
                        isReadOnly
                          ? undefined
                          : (rating) =>
                              onRateAssignment(assignment.weekStartDate, rating)
                      }
                      size="sm"
                      readonly={isReadOnly}
                    />
                  </div>
                )}
              </div>
              {!isReadOnly && (
                <div className="flex items-center gap-1">
                  {!user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onAssignBaker(assignment.weekStartDate)}
                      aria-label={`Assign baker for week of ${weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    >
                      <ChefHat className="h-3.5 w-3.5 text-primary" aria-hidden />
                    </Button>
                  )}
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        onRemoveAssignment(assignment.weekStartDate)
                      }
                      aria-label={`Unassign baker for week of ${weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" aria-hidden />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="text-5xl" aria-hidden>
          🎂
        </div>
        <div>
          <p className="font-display text-lg font-medium">
            No bonanza period yet
          </p>
          <p className="text-sm text-muted-foreground">
            Create a new period to set up your team&apos;s weekly cake schedule.
            Pick a date range and all weeks will be generated automatically.
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Period
        </Button>
      </CardContent>
    </Card>
  )
}
