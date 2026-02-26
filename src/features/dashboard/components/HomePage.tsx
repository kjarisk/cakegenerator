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
    gradient: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    glowColor: 'shadow-glow-accent',
  },
  {
    to: '/bank',
    icon: Library,
    label: 'Cake Bank',
    description:
      'Save your best concepts by theme. Build a reusable library your team can browse.',
    gradient: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    glowColor: 'shadow-glow',
  },
  {
    to: '/bonanza',
    icon: Calendar,
    label: 'Weekly Bonanza',
    description:
      'Assign bakers to weeks, track the schedule on a calendar, and rate each cake.',
    gradient: 'from-chart-4/20 to-chart-4/5',
    iconColor: 'text-chart-4',
    glowColor: 'shadow-glow-sm',
  },
]

const highlights = [
  {
    icon: Palette,
    label: 'AI-Generated Images',
    description: 'Concept art style visuals for every theme',
  },
  {
    icon: ShoppingCart,
    label: 'Cost Estimates',
    description: 'Per-ingredient pricing across store types',
  },
  {
    icon: Share2,
    label: 'Share & Approve',
    description: 'Send links to stakeholders for feedback',
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
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/15 via-accent/8 to-background p-8 md:p-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-chart-4/6 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12">
          {/* Left: copy */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent animate-sparkle" />
              <span className="text-xs font-medium uppercase tracking-widest text-accent">
                Theme Cake Generator
              </span>
            </div>
            <h1 className="text-gradient animate-gradient text-3xl font-extrabold tracking-tight md:text-5xl">
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
                className="bg-accent hover:bg-accent/90 shadow-glow-accent"
              >
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Cake Concept
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
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
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 via-primary/15 to-chart-4/10 shadow-glow">
                <Cake className="h-20 w-20 text-accent/80" />
              </div>
              <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-accent animate-sparkle" />
              <Star className="absolute -bottom-1 -left-2 h-4 w-4 text-primary animate-sparkle [animation-delay:0.5s]" />
              <Sparkles className="absolute right-4 bottom-0 h-3 w-3 text-chart-4 animate-sparkle [animation-delay:1s]" />
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
          />
          <StatCard label="Saved to bank" value={stats.savedToBank} />
          <StatCard label="Theme categories" value={stats.themesSaved} />
          <StatCard label="Cakes rated" value={stats.cakesRated} />
        </div>
      )}

      {/* Feature showcase — 3 column */}
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.to} to={feature.to} className="group">
            <Card className="hover-glow h-full transition-all duration-200">
              <CardHeader className="pb-3">
                <div
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ring-1 ring-border/50`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-base group-hover:text-accent transition-colors">
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
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          What you get with every concept
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <h.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{h.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {h.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme inspiration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Theme Inspiration</CardTitle>
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
                  className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:bg-accent/20 hover:text-accent-foreground hover:shadow-glow-sm"
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/60 px-4 py-3 text-center">
      <p className="text-2xl font-bold text-gradient-accent">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
