import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Star,
  Trash2,
  UserPlus,
  AlertTriangle,
  Cake,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StarRating } from './StarRating'
import type { BonanzaAssignment, User, DayOfWeek } from '@/lib/types'
import { DAY_NAMES } from '@/lib/types'

// --- Types ---

interface CalendarViewProps {
  assignments: BonanzaAssignment[]
  users: User[]
  onRemoveAssignment: (weekStartDate: string) => void
  onRateAssignment: (weekStartDate: string, rating: number) => void
  onAssignBaker: (weekStartDate: string) => void
  isReadOnly?: boolean
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isCakeDay: boolean // is this the cake day for this week's assignment?
  assignment: BonanzaAssignment | null
  isWeekStart: boolean
}

// --- Helpers ---

function getMonthName(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Get the Monday of the week that contains `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = 1
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Check if a date falls within the same Mon-Sun week as `weekStartDate` (ISO string). */
function isInWeek(date: Date, weekStartDate: string): boolean {
  const ws = new Date(weekStartDate + 'T00:00:00')
  const monday = getMonday(ws)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d >= monday && d < nextMonday
}

/** Get the actual date for a given cake day within a week. */
function getCakeDateForWeek(weekStartDate: string, cakeDay: DayOfWeek): Date {
  const monday = getMonday(new Date(weekStartDate + 'T00:00:00'))
  const offset = cakeDay === 0 ? 6 : cakeDay - 1
  const cakeDate = new Date(monday)
  cakeDate.setDate(monday.getDate() + offset)
  return cakeDate
}

function getDaysInMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Start from the Monday on or before the 1st
  const start = getMonday(firstDay)

  // End on the Sunday on or after the last day
  const end = new Date(lastDay)
  const endDay = end.getDay()
  if (endDay !== 0) {
    end.setDate(end.getDate() + (7 - endDay))
  }
  end.setHours(23, 59, 59, 999)

  const days: Date[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

// --- Component ---

export function CalendarView({
  assignments,
  users,
  onRemoveAssignment,
  onRateAssignment,
  onAssignBaker,
  isReadOnly = false,
}: CalendarViewProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const calendarDays: CalendarDay[] = useMemo(() => {
    const rawDays = getDaysInMonthGrid(year, month)

    return rawDays.map((date) => {
      const isCurrentMonth = date.getMonth() === month
      const isToday = isSameDay(date, today)
      const dayOfWeek = date.getDay()
      const isWeekStart = dayOfWeek === 1 // Monday

      // Find assignment whose week contains this date
      const assignment =
        assignments.find((a) => isInWeek(date, a.weekStartDate)) || null

      // Check if this date is the cake day for the assignment
      let isCakeDay = false
      if (assignment && assignment.userId) {
        const cakeDay = assignment.cakeDay ?? 5
        const cakeDate = getCakeDateForWeek(
          assignment.weekStartDate,
          cakeDay as DayOfWeek
        )
        isCakeDay = isSameDay(date, cakeDate)
      }

      return {
        date,
        isCurrentMonth,
        isToday,
        isCakeDay,
        assignment,
        isWeekStart,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, assignments])

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  // Group days into weeks (rows of 7)
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {getMonthName(currentMonth)}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => {
          // Determine the assignment for this entire week row (if any)
          const weekAssignment = week[0].assignment
          const weekUser =
            weekAssignment && weekAssignment.userId
              ? userMap.get(weekAssignment.userId)
              : null
          const isCurrentWeekRow = week.some((d) => d.isToday)
          const weekMonday = week[0].date
          const isPastWeek = !isCurrentWeekRow && weekMonday < today
          const isUnassigned =
            weekAssignment &&
            (!weekAssignment.userId || weekAssignment.userId === '')
          const cakeDay = weekAssignment?.cakeDay ?? 5
          const isNotFriday = cakeDay !== 5 && weekUser

          return (
            <div key={wi} className="group relative">
              <div
                className={[
                  'grid grid-cols-7 border-t border-border',
                  isCurrentWeekRow
                    ? 'bg-warm/8 ring-1 ring-inset ring-warm/30'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={[
                      'relative min-h-[72px] px-2 py-1.5 transition-colors',
                      di < 6 ? 'border-r border-border' : '',
                      !day.isCurrentMonth ? 'opacity-35' : '',
                      day.assignment &&
                      day.assignment.userId &&
                      day.isCurrentMonth &&
                      !isCurrentWeekRow
                        ? 'bg-primary/[0.06]'
                        : '',
                      // Highlight cake day cell
                      day.isCakeDay && day.isCurrentMonth
                        ? 'bg-warm/10 dark:bg-warm/15'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {/* Day number */}
                    <span
                      className={[
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                        day.isToday
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-foreground/80',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {day.date.getDate()}
                    </span>

                    {/* Cake day marker */}
                    {day.isCakeDay && day.isCurrentMonth && (
                      <div className="absolute top-1 right-1">
                        <Cake className="h-3.5 w-3.5 text-warm" />
                      </div>
                    )}

                    {/* Show assignment badge on Monday cell */}
                    {day.isWeekStart && day.isCurrentMonth && (
                      <>
                        {weekUser ? (
                          <div className="mt-1 space-y-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={[
                                    'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight truncate',
                                    isCurrentWeekRow
                                      ? 'bg-warm/20 text-foreground'
                                      : isPastWeek
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-primary/15 text-primary',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                >
                                  <ChefHat className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {weekUser.displayName}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {weekUser.displayName} — Week of{' '}
                                  {new Date(
                                    weekAssignment!.weekStartDate + 'T00:00:00'
                                  ).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                  {isNotFriday && (
                                    <>
                                      {' '}
                                      — Cake on{' '}
                                      {DAY_NAMES[cakeDay as DayOfWeek]}!
                                    </>
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Non-Friday badge */}
                            {isNotFriday && (
                              <div className="flex items-center gap-0.5 text-[10px] text-warm font-medium">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                <span>{DAY_NAMES[cakeDay as DayOfWeek]}</span>
                              </div>
                            )}

                            {/* Cake name badge */}
                            {weekAssignment?.cakeName && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                {weekAssignment.cakeName}
                              </div>
                            )}

                            {/* Star rating for past/current weeks */}
                            {(isPastWeek || isCurrentWeekRow) && (
                              <StarRating
                                value={weekAssignment!.rating}
                                onChange={
                                  isReadOnly
                                    ? undefined
                                    : (rating) =>
                                        onRateAssignment(
                                          weekAssignment!.weekStartDate,
                                          rating
                                        )
                                }
                                size="sm"
                                readonly={isReadOnly}
                              />
                            )}
                            {/* Compact read-only stars for future rated weeks */}
                            {!isPastWeek &&
                              !isCurrentWeekRow &&
                              weekAssignment?.rating &&
                              weekAssignment.rating > 0 && (
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-2.5 w-2.5 ${s <= (weekAssignment.rating ?? 0) ? 'fill-warm text-warm' : 'fill-transparent text-muted-foreground/30'}`}
                                    />
                                  ))}
                                </div>
                              )}
                          </div>
                        ) : isUnassigned ? (
                          <div className="mt-1">
                            <div className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground leading-tight">
                              <UserPlus className="h-3 w-3 shrink-0 opacity-50" />
                              <span className="italic opacity-60">
                                Unassigned
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Week row hover actions */}
              {!isReadOnly && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex md:hidden md:group-hover:flex items-center gap-1">
                  {weekUser ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm"
                            onClick={() =>
                              weekAssignment &&
                              onAssignBaker(weekAssignment.weekStartDate)
                            }
                          >
                            <ChefHat className="h-3 w-3 text-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Re-assign baker</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm"
                            onClick={() =>
                              weekAssignment &&
                              onRemoveAssignment(weekAssignment.weekStartDate)
                            }
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Unassign baker</TooltipContent>
                      </Tooltip>
                    </>
                  ) : weekAssignment ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm"
                          onClick={() =>
                            onAssignBaker(weekAssignment.weekStartDate)
                          }
                        >
                          <UserPlus className="h-3 w-3 text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Assign baker</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          Today
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warm/20" />
          Current week
        </div>
        <div className="flex items-center gap-1.5">
          <ChefHat className="h-3 w-3" />
          Assigned baker
        </div>
        <div className="flex items-center gap-1.5">
          <Cake className="h-3 w-3 text-warm" />
          Cake day
        </div>
      </div>

      {/* Upcoming assignments summary (below calendar) */}
      {assignments.filter((a) => a.userId).length > 0 && (
        <UpcomingAssignments
          assignments={assignments}
          userMap={userMap}
          today={today}
        />
      )}
    </div>
  )
}

// --- Upcoming assignments summary ---

function UpcomingAssignments({
  assignments,
  userMap,
  today,
}: {
  assignments: BonanzaAssignment[]
  userMap: Map<string, User>
  today: Date
}) {
  const upcoming = assignments
    .filter((a) => {
      if (!a.userId) return false
      const ws = new Date(a.weekStartDate + 'T00:00:00')
      const monday = getMonday(ws)
      const nextMonday = new Date(monday)
      nextMonday.setDate(monday.getDate() + 7)
      // Include current week and future weeks
      return nextMonday > today
    })
    .slice(0, 4)

  if (upcoming.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">Upcoming</p>
      <div className="flex flex-wrap gap-2">
        {upcoming.map((a) => {
          const user = userMap.get(a.userId)
          const ws = new Date(a.weekStartDate + 'T00:00:00')
          const isNow = isInWeek(today, a.weekStartDate)
          const cakeDay = a.cakeDay ?? 5
          const isNotFriday = cakeDay !== 5
          return (
            <Badge
              key={a.weekStartDate}
              variant={isNow ? 'default' : 'secondary'}
              className="gap-1.5 py-1"
            >
              <ChefHat className="h-3 w-3" />
              <span>{user?.displayName || 'Unknown'}</span>
              <span className="opacity-60">
                {ws.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {isNotFriday && (
                <span className="text-[10px] text-warm">
                  {DAY_NAMES[cakeDay as DayOfWeek].slice(0, 3)}
                </span>
              )}
              {isNow && <span className="text-[10px] opacity-75">Now</span>}
              {a.rating && a.rating > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]">
                  <Star className="h-2.5 w-2.5 fill-warm text-warm" />
                  {a.rating}
                </span>
              )}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
