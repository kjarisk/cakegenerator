// =============================================================================
// HypeBanner — "This Week" party hero section
// Full party mode: confetti burst, animated gradient, bouncing cake emoji,
// pulsing glow, non-Friday cake day alert
// =============================================================================

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { BonanzaAssignment, User, DayOfWeek } from '@/lib/types'
import { DAY_NAMES } from '@/lib/types'

interface HypeBannerProps {
  assignment: BonanzaAssignment
  user: User | undefined
  periodName: string
}

/** Get the Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Check if a date (week start) is in the current Mon–Sun week. */
function isCurrentWeek(weekStartDate: string): boolean {
  const now = new Date()
  const thisMonday = getMonday(now)
  const weekMonday = getMonday(new Date(weekStartDate + 'T00:00:00'))
  return thisMonday.getTime() === weekMonday.getTime()
}

/** Get the actual cake date for this week's assignment. */
function getCakeDate(weekStartDate: string, cakeDay: DayOfWeek): Date {
  const monday = getMonday(new Date(weekStartDate + 'T00:00:00'))
  // Monday = day 1, so offset = cakeDay - 1 (but Sunday = 0 means offset = 6)
  const offset = cakeDay === 0 ? 6 : cakeDay - 1
  const cakeDate = new Date(monday)
  cakeDate.setDate(monday.getDate() + offset)
  return cakeDate
}

function isCakeDayToday(weekStartDate: string, cakeDay: DayOfWeek): boolean {
  const today = new Date()
  const cake = getCakeDate(weekStartDate, cakeDay)
  return (
    today.getFullYear() === cake.getFullYear() &&
    today.getMonth() === cake.getMonth() &&
    today.getDate() === cake.getDate()
  )
}

export function HypeBanner({ assignment, user, periodName }: HypeBannerProps) {
  const confettiFired = useRef(false)
  const [bounceClass, setBounceClass] = useState('animate-bounce')

  const isThisWeek = isCurrentWeek(assignment.weekStartDate)
  const cakeDay = assignment.cakeDay ?? 5
  const isNotFriday = cakeDay !== 5
  const isCakeToday = isCakeDayToday(assignment.weekStartDate, cakeDay)
  const cakeDate = getCakeDate(assignment.weekStartDate, cakeDay)
  const bakerName = user?.displayName || 'Someone mysterious'

  // Fire confetti on first mount
  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true

    // Short delay for dramatic effect
    const timer = setTimeout(() => {
      // Left burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.15, y: 0.6 },
        colors: ['#f472b6', '#a855f7', '#facc15', '#fb923c', '#34d399'],
        startVelocity: 35,
        gravity: 0.8,
        ticks: 200,
      })
      // Right burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.85, y: 0.6 },
        colors: ['#f472b6', '#a855f7', '#facc15', '#fb923c', '#34d399'],
        startVelocity: 35,
        gravity: 0.8,
        ticks: 200,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Stop bounce after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setBounceClass(''), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!isThisWeek) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-warm/30">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-amber-400/20 dark:from-purple-600/30 dark:via-pink-500/25 dark:to-amber-400/20 animate-gradient-shift"
        aria-hidden
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-radial-glow-warm opacity-40" aria-hidden />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-8 text-center sm:py-10">
        {/* Bouncing cake emoji */}
        <div className={`text-5xl sm:text-6xl ${bounceClass}`} aria-hidden>
          {isCakeToday ? '🎂' : '🎂'}
        </div>

        {/* Main headline */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {periodName}
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {isCakeToday ? (
              <span className="text-gradient-warm">CAKE DAY IS TODAY!</span>
            ) : (
              <>
                <span className="text-gradient-warm">
                  This Week&apos;s Baker
                </span>
              </>
            )}
          </h2>
        </div>

        {/* Baker name with glow */}
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground sm:text-2xl animate-pulse-glow">
            {bakerName}
          </span>
          {assignment.cakeName && (
            <Badge variant="secondary" className="text-xs">
              {assignment.cakeName}
            </Badge>
          )}
        </div>

        {/* Cake day info */}
        <p className="text-sm text-muted-foreground">
          Cake day:{' '}
          <span className="font-semibold text-foreground">
            {DAY_NAMES[cakeDay as DayOfWeek]},{' '}
            {cakeDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </p>

        {/* Non-Friday alert */}
        {isNotFriday && (
          <div
            role="alert"
            className="mt-2 flex items-center gap-2 rounded-lg border border-warm/40 bg-warm/10 px-4 py-2 text-sm font-medium"
          >
            <AlertTriangle className="h-4 w-4 text-warm shrink-0" aria-hidden />
            <span>
              <span className="font-bold text-warm">HEADS UP!</span> Cake day is{' '}
              <span className="font-bold">
                {DAY_NAMES[cakeDay as DayOfWeek]}
              </span>{' '}
              this week, not Friday!
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
