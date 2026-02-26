import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  Cake,
  Plus,
  Library,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
  Palette,
  ShoppingCart,
  Share2,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAll } from '@/lib/storage'
import type { CakeConcept, ThemeCategory, BonanzaSchedule } from '@/lib/types'

const features = [
  {
    to: '/create',
    icon: Sparkles,
    label: 'Generate Concepts',
    description:
      'Turn any theme into a complete cake concept with recipe, image, and cost estimate.',
    gradient: 'from-accent/25 to-accent/5',
    iconColor: 'text-accent',
    borderColor: 'border-l-accent/60',
  },
  {
    to: '/bank',
    icon: Library,
    label: 'Cake Bank',
    description:
      'Save your best concepts by theme. Build a reusable library your team can browse.',
    gradient: 'from-primary/25 to-primary/5',
    iconColor: 'text-primary',
    borderColor: 'border-l-primary/60',
  },
  {
    to: '/bonanza',
    icon: Calendar,
    label: 'Weekly Bonanza',
    description:
      'Assign bakers to weeks, track the schedule on a calendar, and rate each cake.',
    gradient: 'from-warm/20 to-warm/5',
    iconColor: 'text-warm',
    borderColor: 'border-l-warm/60',
  },
]

const highlights = [
  {
    icon: Palette,
    label: 'AI-Generated Images',
    description: 'Concept art style visuals for every theme',
    color: 'text-accent',
    bg: 'bg-accent/15',
  },
  {
    icon: ShoppingCart,
    label: 'Cost Estimates',
    description: 'Per-ingredient pricing across store types',
    color: 'text-warm',
    bg: 'bg-warm/15',
  },
  {
    icon: Share2,
    label: 'Share & Approve',
    description: 'Send links to stakeholders for feedback',
    color: 'text-primary',
    bg: 'bg-primary/15',
  },
]

const exampleThemes = [
  { name: 'Space', emoji: '🚀' },
  { name: 'Retro 80s', emoji: '🕹️' },
  { name: 'Tropical', emoji: '🌴' },
  { name: 'Halloween', emoji: '🎃' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Under the Sea', emoji: '🐠' },
  { name: 'Unicorn', emoji: '🦄' },
  { name: 'Superhero', emoji: '🦸' },
]

function useStats() {
  return useMemo(() => {
    const concepts = getAll<CakeConcept>('cakeConcepts')
    const categories = getAll<ThemeCategory>('themeCategories')
    const schedules = getAll<BonanzaSchedule>('bonanzaSchedules')
    const savedCount = concepts.filter((c) => c.savedToBank).length
    const ratings = schedules.flatMap((s) =>
      s.assignments.filter((a) => a.rating && a.rating > 0)
    )
    return {
      conceptsGenerated: concepts.length,
      themesSaved: categories.length,
      cakesRated: ratings.length,
      savedToBank: savedCount,
    }
  }, [])
}

export function Component() {
  const stats = useStats()

  return (
    <div className="flex flex-col gap-10">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-primary/20 via-accent/10 to-background p-8 md:p-12">
        {/* Decorative blobs — boosted opacity for drama */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/4 h-40 w-40 rounded-full bg-warm/15 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12">
          {/* Left: copy */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warm animate-sparkle" />
              <span className="text-xs font-semibold uppercase tracking-widest text-warm">
                Theme Cake Generator
              </span>
            </div>
            <h1 className="text-gradient animate-gradient font-display text-3xl font-extrabold tracking-tight md:text-5xl">
              From idea to cake — in seconds
            </h1>
            <p className="max-w-lg text-muted-foreground leading-relaxed">
              Describe a theme, get a complete cake concept: recipe,
              AI-generated image, cost estimate, and shopping plan. Save
              favorites to your Cake Bank and share for approval.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 shadow-glow-accent animate-pulse-glow font-semibold"
              >
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Cake Concept
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border hover:border-warm/40 hover:shadow-glow-warm"
              >
                <Link to="/bank">
                  Browse Cake Bank
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: animated cake illustration */}
          <div className="hidden md:block">
            <div className="animate-float relative">
              <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 via-primary/20 to-warm/15 shadow-glow-accent ring-1 ring-accent/20">
                <Cake className="h-20 w-20 text-accent" />
              </div>
              <Sparkles className="absolute -right-3 -top-3 h-6 w-6 text-warm animate-sparkle" />
              <Star className="absolute -bottom-2 -left-2 h-5 w-5 text-warm animate-sparkle [animation-delay:0.5s]" />
              <Crown className="absolute -right-1 top-1/2 h-4 w-4 text-accent animate-sparkle [animation-delay:0.8s]" />
              <Sparkles className="absolute left-1 top-0 h-3 w-3 text-primary animate-sparkle [animation-delay:1.2s]" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {(stats.conceptsGenerated > 0 || stats.themesSaved > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Concepts generated"
            value={stats.conceptsGenerated}
            variant="accent"
          />
          <StatCard
            label="Saved to bank"
            value={stats.savedToBank}
            variant="warm"
          />
          <StatCard
            label="Theme categories"
            value={stats.themesSaved}
            variant="primary"
          />
          <StatCard
            label="Cakes rated"
            value={stats.cakesRated}
            variant="warm"
          />
        </div>
      )}

      {/* Feature showcase — 3 column */}
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.to} to={feature.to} className="group">
            <Card
              className={`hover-glow h-full border-l-4 ${feature.borderColor} transition-all duration-200`}
            >
              <CardHeader className="pb-3">
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ring-1 ring-border/60`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <CardTitle className="font-display text-base group-hover:text-accent transition-colors">
                  {feature.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* What you get section */}
      <div>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          What you get with every concept
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/80 p-4 transition-colors hover:border-border"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${h.bg}`}
              >
                <h.icon className={`h-4 w-4 ${h.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">{h.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {h.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme inspiration */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Theme Inspiration
          </CardTitle>
          <CardDescription>
            Click a theme to start generating concepts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {exampleThemes.map((theme) => (
              <Link
                key={theme.name}
                to={`/create?theme=${encodeURIComponent(theme.name)}`}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:bg-accent/20 hover:text-accent-foreground hover:shadow-glow-sm hover:scale-105"
                >
                  <span className="mr-1.5">{theme.emoji}</span>
                  {theme.name}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  variant = 'accent',
}: {
  label: string
  value: number
  variant?: 'accent' | 'warm' | 'primary'
}) {
  const gradientClass =
    variant === 'warm'
      ? 'text-gradient-warm'
      : variant === 'primary'
        ? 'text-gradient'
        : 'text-gradient-accent'
  const borderClass =
    variant === 'warm'
      ? 'border-warm/30'
      : variant === 'primary'
        ? 'border-primary/30'
        : 'border-accent/30'

  return (
    <div
      className={`rounded-lg border ${borderClass} bg-card/80 px-4 py-3 text-center`}
    >
      <p className={`font-display text-2xl font-bold ${gradientClass}`}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
