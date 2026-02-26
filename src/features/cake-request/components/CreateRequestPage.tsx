import { useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Sparkles,
  Loader2,
  Users,
  Wand2,
  ShoppingBag,
  Palette,
} from 'lucide-react'

import {
  createCakeRequestSchema,
  type CreateCakeRequestInput,
} from '@/lib/schemas'
import { useCreateCakeRequestMutation } from '../api/use-cake-request-queries'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { DietaryToggle } from '@/lib/types'

// ─── Static data ─────────────────────────────────────────────────────────────

const DIETARY_OPTIONS: {
  value: DietaryToggle
  label: string
  emoji: string
}[] = [
  { value: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { value: 'nut-free', label: 'Nut-free', emoji: '🥜' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'lactose-free', label: 'Lactose-free', emoji: '🥛' },
]

const SKILL_LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Simple & stress-free',
    emoji: '🎂',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience',
    emoji: '🍰',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Complex artistry',
    emoji: '👨‍🍳',
  },
]

const BUDGET_LEVELS = [
  { value: 'low', label: 'Budget', description: 'Under $30', emoji: '💚' },
  { value: 'medium', label: 'Standard', description: '$30–$60', emoji: '💛' },
  { value: 'high', label: 'Premium', description: '$60+', emoji: '💜' },
]

const CAKE_STYLES = [
  { value: 'buttercream', label: 'Buttercream', emoji: '🧁' },
  { value: 'fondant', label: 'Fondant', emoji: '🎨' },
  { value: 'naked', label: 'Naked Cake', emoji: '🪵' },
  { value: 'drip', label: 'Drip', emoji: '🍫' },
  { value: 'other', label: 'Surprise me', emoji: '✨' },
]

const THEME_PROMPTS = [
  'A cosmic galaxy cake with swirling nebulas and edible stars',
  'Retro 80s neon arcade vibes with pixel art decorations',
  'Enchanted forest with mushrooms, moss, and fairy lights',
  'Tropical sunset with flamingos and hibiscus flowers',
  'Deep ocean with coral reefs and bioluminescent jellyfish',
]

// ─── Floating decoration element ─────────────────────────────────────────────

function FloatingOrb({
  size,
  color,
  style,
}: {
  size: string
  color: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="pointer-events-none absolute rounded-full blur-3xl"
      style={{ width: size, height: size, background: color, ...style }}
    />
  )
}

// ─── Section wrapper with icon + label ───────────────────────────────────────

function SectionHeader({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode
  label: string
  description?: string
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/25">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-base font-semibold leading-tight">
          {label}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

// ─── Pill selector ────────────────────────────────────────────────────────────

function PillOption({
  emoji,
  label,
  description,
  selected,
  onClick,
}: {
  emoji: string
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-accent bg-accent/10 shadow-glow-accent ring-1 ring-accent/40 dark:bg-accent/15'
          : 'border-border bg-card hover:border-accent/40 hover:bg-accent/5',
      ].join(' ')}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span
        className={`text-xs font-semibold leading-tight ${selected ? 'text-accent' : ''}`}
      >
        {label}
      </span>
      {description && (
        <span className="text-[10px] leading-tight text-muted-foreground">
          {description}
        </span>
      )}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Component() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateCakeRequestMutation()

  // Pre-fill the theme prompt from ?theme= query param (e.g. homepage inspiration chips)
  const themeParam = searchParams.get('theme') ?? ''

  const form = useForm<CreateCakeRequestInput>({
    resolver: zodResolver(createCakeRequestSchema),
    defaultValues: {
      customerPrompt: themeParam,
      numConcepts: 2,
      constraints: {
        servings: 12,
        skillLevel: 'intermediate',
        dietaryToggles: [],
        dietaryNotes: '',
        budgetRange: 'medium',
        preferredStyle: 'buttercream',
      },
    },
  })

  async function onSubmit(data: CreateCakeRequestInput) {
    try {
      const result = await createMutation.mutateAsync(data)
      toast.success(
        `Generated ${result.concepts.length} cake concept${result.concepts.length > 1 ? 's' : ''}!`
      )
      navigate(`/concepts/${result.concepts[0].id}`)
    } catch {
      toast.error('Failed to generate cake concepts. Please try again.')
    }
  }

  const numConcepts = form.watch('numConcepts')
  const currentPrompt = form.watch('customerPrompt')

  function insertPrompt(p: string) {
    form.setValue('customerPrompt', p, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* ── Hero: Prompt Canvas ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-primary/10 via-accent/8 to-warm/10 dark:from-primary/20 dark:via-accent/12 dark:to-warm/15 p-6 pb-8 shadow-glow-sm">
          {/* Background orbs */}
          <FloatingOrb
            size="180px"
            color="oklch(0.7 0.28 330 / 0.12)"
            style={{ top: '-40px', right: '-40px' }}
          />
          <FloatingOrb
            size="120px"
            color="oklch(0.78 0.18 85 / 0.10)"
            style={{ bottom: '-30px', left: '10%' }}
          />
          <FloatingOrb
            size="100px"
            color="oklch(0.62 0.24 285 / 0.10)"
            style={{ top: '20%', right: '25%' }}
          />

          {/* Floating cake emoji decorations */}
          <span
            className="pointer-events-none absolute right-6 top-4 animate-float text-4xl opacity-20 select-none"
            style={{ animationDelay: '0s' }}
          >
            🎂
          </span>
          <span
            className="pointer-events-none absolute right-24 bottom-4 animate-float text-2xl opacity-15 select-none"
            style={{ animationDelay: '1.2s' }}
          >
            ✨
          </span>
          <span
            className="pointer-events-none absolute right-14 top-1/2 animate-float text-3xl opacity-15 select-none"
            style={{ animationDelay: '0.6s' }}
          >
            🍰
          </span>

          {/* Header */}
          <div className="relative mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 ring-2 ring-accent/30 shadow-glow-accent">
              <Wand2 className="h-6 w-6 text-accent animate-sparkle" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-gradient-accent">
                Create Cake Concept
              </h1>
              <p className="text-sm text-muted-foreground">
                Describe your theme — we'll generate recipes, images &amp; a
                shopping plan.
              </p>
            </div>
          </div>

          {/* Prompt textarea */}
          <FormField
            control={form.control}
            name="customerPrompt"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <Textarea
                    placeholder="e.g. A space-themed birthday cake with galaxies, planets, and stars. Purple and blue color scheme. Fun and playful vibe for a 7-year-old's party."
                    className="relative z-10 min-h-[120px] resize-none border-accent/30 bg-background/60 backdrop-blur-sm text-sm placeholder:text-muted-foreground/50 focus-visible:border-accent/60 focus-visible:ring-accent/30 dark:bg-card/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inspiration chips */}
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Need inspiration?
            </p>
            <div className="flex flex-wrap gap-2">
              {THEME_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => insertPrompt(p)}
                  className={[
                    'rounded-full border px-3 py-1 text-[11px] leading-tight transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    currentPrompt === p
                      ? 'border-accent/60 bg-accent/15 text-accent'
                      : 'border-border/60 bg-background/40 text-muted-foreground hover:border-accent/40 hover:text-foreground',
                  ].join(' ')}
                >
                  {p.length > 48 ? p.slice(0, 46) + '…' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Concept count picker — inline in hero */}
          <FormField
            control={form.control}
            name="numConcepts"
            render={({ field }) => (
              <FormItem className="mt-5">
                <div className="flex items-center gap-3">
                  <FormLabel className="shrink-0 text-sm font-medium">
                    How many concepts?
                  </FormLabel>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => field.onChange(n)}
                        aria-pressed={field.value === n}
                        className={[
                          'h-8 w-8 rounded-lg border text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          field.value === n
                            ? 'border-accent bg-accent/20 text-accent shadow-glow-accent scale-110'
                            : 'border-border/50 bg-background/40 text-muted-foreground hover:border-accent/40 hover:text-foreground',
                        ].join(' ')}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {numConcepts === 1 ? 'unique concept' : `unique concepts`}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Skill Level ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <SectionHeader
            icon={<span className="text-sm">🎓</span>}
            label="Skill Level"
            description="How experienced is the baker?"
          />
          <FormField
            control={form.control}
            name="constraints.skillLevel"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    {SKILL_LEVELS.map((level) => (
                      <PillOption
                        key={level.value}
                        emoji={level.emoji}
                        label={level.label}
                        description={level.description}
                        selected={field.value === level.value}
                        onClick={() => field.onChange(level.value)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Budget + Servings ────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Budget */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <SectionHeader
              icon={<ShoppingBag className="h-4 w-4 text-accent" />}
              label="Budget Range"
              description="Total ingredient spend"
            />
            <FormField
              control={form.control}
              name="constraints.budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      {BUDGET_LEVELS.map((level) => (
                        <PillOption
                          key={level.value}
                          emoji={level.emoji}
                          label={level.label}
                          description={level.description}
                          selected={field.value === level.value}
                          onClick={() => field.onChange(level.value)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Servings */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <SectionHeader
              icon={<Users className="h-4 w-4 text-accent" />}
              label="Servings"
              description="How many people to feed?"
            />
            <FormField
              control={form.control}
              name="constraints.servings"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.max(1, field.value - 1))
                        }
                        aria-label="Decrease servings"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-lg font-bold text-muted-foreground transition hover:border-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        −
                      </button>
                      <Input
                        type="number"
                        min={1}
                        max={200}
                        className="h-10 text-center text-lg font-bold tabular-nums"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.min(200, field.value + 1))
                        }
                        aria-label="Increase servings"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-lg font-bold text-muted-foreground transition hover:border-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        +
                      </button>
                    </div>
                  </FormControl>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {field.value <= 6
                      ? 'Small gathering'
                      : field.value <= 20
                        ? 'Party size'
                        : field.value <= 50
                          ? 'Big celebration'
                          : 'Mega event 🎉'}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Cake Style ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <SectionHeader
            icon={<Palette className="h-4 w-4 text-accent" />}
            label="Cake Style"
            description="Pick the decoration technique"
          />
          <FormField
            control={form.control}
            name="constraints.preferredStyle"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {CAKE_STYLES.map((style) => (
                      <PillOption
                        key={style.value}
                        emoji={style.emoji}
                        label={style.label}
                        selected={field.value === style.value}
                        onClick={() => field.onChange(style.value)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Dietary Requirements ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <SectionHeader
            icon={<span className="text-sm">🥗</span>}
            label="Dietary Requirements"
            description="Toggle any that apply — we'll adapt the recipe"
          />
          <FormField
            control={form.control}
            name="constraints.dietaryToggles"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="constraints.dietaryToggles"
                        render={({ field }) => {
                          const isOn = field.value?.includes(option.value)
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                const current = field.value || []
                                field.onChange(
                                  isOn
                                    ? current.filter((v) => v !== option.value)
                                    : [...current, option.value]
                                )
                              }}
                              className={[
                                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                isOn
                                  ? 'border-success/60 bg-success/10 text-success ring-1 ring-success/30 dark:bg-success/15'
                                  : 'border-border/60 bg-muted/40 text-muted-foreground hover:border-success/30 hover:text-foreground',
                              ].join(' ')}
                            >
                              <span>{option.emoji}</span>
                              <span>{option.label}</span>
                              {isOn && (
                                <span className="ml-0.5 text-xs">✓</span>
                              )}
                            </button>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dietary Notes */}
          <FormField
            control={form.control}
            name="constraints.dietaryNotes"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-xs text-muted-foreground">
                  Additional notes (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any other requirements, allergies, or preferences…"
                    className="min-h-[60px] resize-none text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Generate CTA ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <Button
            type="submit"
            size="lg"
            disabled={createMutation.isPending}
            className={[
              'relative h-14 w-full overflow-hidden rounded-2xl px-8 text-base font-bold tracking-wide sm:w-auto sm:min-w-[280px]',
              'bg-gradient-to-r from-primary via-accent to-warm text-white',
              'animate-gradient-shift shadow-glow-accent',
              'hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150',
              'disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100',
            ].join(' ')}
          >
            {/* Shimmer overlay */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

            {createMutation.isPending ? (
              <span className="relative flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating {numConcepts} concept{numConcepts > 1 ? 's' : ''}…
              </span>
            ) : (
              <span className="relative flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate {numConcepts} Cake Concept{numConcepts > 1 ? 's' : ''}
              </span>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            AI-powered · GPT-4o recipes · DALL-E 3 images
          </p>
        </div>
      </form>
    </Form>
  )
}
