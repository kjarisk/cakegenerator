import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Sparkles, Loader2 } from 'lucide-react'

import {
  createCakeRequestSchema,
  type CreateCakeRequestInput,
} from '@/lib/schemas'
import { useCreateCakeRequestMutation } from '../api/use-cake-request-queries'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import type { DietaryToggle } from '@/lib/types'

const DIETARY_OPTIONS: { value: DietaryToggle; label: string }[] = [
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'nut-free', label: 'Nut-free' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'lactose-free', label: 'Lactose-free' },
]

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Simple techniques' },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Complex decorations',
  },
]

const BUDGET_LEVELS = [
  { value: 'low', label: 'Budget-friendly', description: 'Under $30' },
  { value: 'medium', label: 'Standard', description: '$30-$60' },
  { value: 'high', label: 'Premium', description: '$60+' },
]

const CAKE_STYLES = [
  { value: 'buttercream', label: 'Buttercream' },
  { value: 'fondant', label: 'Fondant' },
  { value: 'naked', label: 'Naked Cake' },
  { value: 'drip', label: 'Drip Cake' },
  { value: 'other', label: 'Other / Surprise me' },
]

export function Component() {
  const navigate = useNavigate()
  const createMutation = useCreateCakeRequestMutation()

  const form = useForm<CreateCakeRequestInput>({
    resolver: zodResolver(createCakeRequestSchema),
    defaultValues: {
      customerPrompt: '',
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
      // Navigate to the first concept
      navigate(`/concepts/${result.concepts[0].id}`)
    } catch {
      toast.error('Failed to generate cake concepts. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header with themed banner */}
      <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-r from-primary/15 via-accent/8 to-warm/8 px-6 py-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-warm/15 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 ring-1 ring-accent/30">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Create Cake Concept
            </h1>
            <p className="text-sm text-muted-foreground">
              Describe your theme and constraints — we&apos;ll generate recipes,
              images, and shopping plans.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Theme & Prompt */}
          <Card className="border-border/60 shadow-glow-sm">
            <CardHeader>
              <CardTitle className="font-display">Theme & Prompt</CardTitle>
              <CardDescription>
                What kind of cake are you looking for? Describe the occasion,
                vibe, colors, or any specific theme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customerPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. A space-themed birthday cake with galaxies, planets, and stars. Purple and blue color scheme. Fun and playful vibe for a 7-year-old's party."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be as descriptive as you like — mention colors, occasions,
                      vibes, or specific elements.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numConcepts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Number of Concepts:{' '}
                      <Badge variant="secondary">{field.value}</Badge>
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={([val]) => field.onChange(val)}
                        className="py-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Generate 1–5 different concepts to choose from.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Constraints */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display">Constraints</CardTitle>
              <CardDescription>
                Help us tailor the recipe to your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Servings */}
                <FormField
                  control={form.control}
                  name="constraints.servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={200}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skill Level */}
                <FormField
                  control={form.control}
                  name="constraints.skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SKILL_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label} — {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget */}
                <FormField
                  control={form.control}
                  name="constraints.budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUDGET_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label} — {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cake Style */}
                <FormField
                  control={form.control}
                  name="constraints.preferredStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cake Style</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CAKE_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Dietary Toggles */}
              <FormField
                control={form.control}
                name="constraints.dietaryToggles"
                render={() => (
                  <FormItem>
                    <FormLabel>Dietary Requirements</FormLabel>
                    <div className="flex flex-wrap gap-4 pt-1">
                      {DIETARY_OPTIONS.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="constraints.dietaryToggles"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || []
                                    field.onChange(
                                      checked
                                        ? [...current, option.value]
                                        : current.filter(
                                            (v) => v !== option.value
                                          )
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dietary Notes */}
              <FormField
                control={form.control}
                name="constraints.dietaryNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Dietary Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other dietary requirements or preferences..."
                        className="min-h-[60px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={createMutation.isPending}
            className="w-full bg-accent hover:bg-accent/90 shadow-glow-accent font-semibold sm:w-auto"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating concepts...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Cake Concepts
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
