import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Trash2,
  UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { BonanzaAssignment, User } from '@/lib/types'

// --- Types ---

interface CalendarViewProps {
  assignments: BonanzaAssignment[]
  users: User[]
  onRemoveAssignment: (weekStartDate: string) => void
  onAddAssignment: () => void
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
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
  onAddAssignment,
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

      return { date, isCurrentMonth, isToday, assignment, isWeekStart }
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
        <h2 className="text-lg font-semibold">{getMonthName(currentMonth)}</h2>
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
          const weekUser = weekAssignment
            ? userMap.get(weekAssignment.userId)
            : null
          const isCurrentWeekRow = week.some((d) => d.isToday)
          const weekMonday = week[0].date
          const isPastWeek = !isCurrentWeekRow && weekMonday < today

          return (
            <div key={wi} className="group relative">
              <div
                className={[
                  'grid grid-cols-7 border-t border-border',
                  isCurrentWeekRow
                    ? 'bg-accent/8 ring-1 ring-inset ring-accent/20'
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

                    {/* Show assignment badge on Monday cell */}
                    {day.isWeekStart &&
                      weekAssignment &&
                      weekUser &&
                      day.isCurrentMonth && (
                        <div className="mt-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={[
                                  'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight truncate',
                                  isCurrentWeekRow
                                    ? 'bg-accent/20 text-accent-foreground'
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
                                  weekAssignment.weekStartDate + 'T00:00:00'
                                ).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Week row hover actions */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                {weekAssignment ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm"
                        onClick={() =>
                          onRemoveAssignment(weekAssignment.weekStartDate)
                        }
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove assignment</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-background/80 backdrop-blur-sm shadow-sm"
                        onClick={onAddAssignment}
                      >
                        <UserPlus className="h-3 w-3 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Assign this week</TooltipContent>
                  </Tooltip>
                )}
              </div>
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
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent/20" />
          Current week
        </div>
        <div className="flex items-center gap-1.5">
          <ChefHat className="h-3 w-3" />
          Assigned baker
        </div>
        {assignments.length === 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onAddAssignment}
          >
            <UserPlus className="mr-1 h-3 w-3" />
            Assign first week
          </Button>
        )}
      </div>

      {/* Upcoming assignments summary (below calendar) */}
      {assignments.length > 0 && (
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
              {isNow && <span className="text-[10px] opacity-75">Now</span>}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
