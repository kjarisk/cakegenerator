import { Link } from 'react-router'
import {
  Cake,
  Plus,
  Library,
  Calendar,
  Sparkles,
  ArrowRight,
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

const quickActions = [
  {
    to: '/create',
    icon: Plus,
    label: 'Create Cake',
    description: 'Generate new cake concepts from a theme',
    color: 'bg-accent text-accent-foreground',
  },
  {
    to: '/bank',
    icon: Library,
    label: 'Cake Bank',
    description: 'Browse saved themes and concepts',
    color: 'bg-primary text-primary-foreground',
  },
  {
    to: '/bonanza',
    icon: Calendar,
    label: 'Bonanza',
    description: 'Weekly cake schedule & assignments',
    color: 'bg-chart-4 text-white',
  },
]

const exampleThemes = [
  { name: 'Space', emoji: '🚀' },
  { name: 'Retro 80s', emoji: '🕹️' },
  { name: 'Tropical', emoji: '🌴' },
  { name: 'Halloween', emoji: '🎃' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Under the Sea', emoji: '🐠' },
]

export function Component() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background p-8 md:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Cake className="h-8 w-8 text-accent" />
            <Sparkles className="h-5 w-5 text-primary animate-shimmer" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Theme Cake Generator
          </h1>
          <p className="max-w-lg text-muted-foreground">
            Turn any theme into a complete cake concept — recipe, image, cost
            estimate, and shopping plan. Save your favorites to the Cake Bank
            and share for team approval.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
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
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="group">
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader className="pb-3">
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {action.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Theme inspiration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme Inspiration</CardTitle>
          <CardDescription>
            Popular cake themes to get you started. Click "Create Cake" to
            generate concepts for any theme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {exampleThemes.map((theme) => (
              <Badge
                key={theme.name}
                variant="secondary"
                className="cursor-default px-3 py-1.5 text-sm"
              >
                <span className="mr-1.5">{theme.emoji}</span>
                {theme.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
