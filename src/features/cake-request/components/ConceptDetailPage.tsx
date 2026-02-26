import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  ShoppingCart,
  Share2,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Package,
  PartyPopper,
  ImageIcon,
  UtensilsCrossed,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useCakeConceptQuery,
  useConceptsByRequestQuery,
  useRegenerateConceptMutation,
} from '../api/use-cake-request-queries'
import { useRemoveConceptFromBankMutation } from '@/features/cake-bank/api/use-cake-bank-queries'
import { SaveToBankDialog } from '@/features/cake-bank/components/SaveToBankDialog'
import { ShareDialog } from '@/features/sharing/components/ShareDialog'

import { CakeImage } from '@/components/CakeImage'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RegenerateMode } from '@/lib/ai-service'

export function Component() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: concept, isLoading, error } = useCakeConceptQuery(id || '')
  const { data: siblingConcepts } = useConceptsByRequestQuery(
    concept?.requestId || ''
  )
  const removeFromBankMutation = useRemoveConceptFromBankMutation()
  const regenerateMutation = useRegenerateConceptMutation()
  const [saveToBankOpen, setSaveToBankOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  if (isLoading) {
    return <ConceptSkeleton />
  }

  if (error || !concept) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-xl font-bold">Concept not found</h2>
        <p className="text-muted-foreground">
          This cake concept doesn&apos;t exist or has been removed.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  const handleSaveToBankClick = () => {
    if (concept.savedToBank) {
      // Remove from bank
      removeFromBankMutation.mutate(concept.id, {
        onSuccess: () => toast.success('Removed from Cake Bank'),
        onError: () => toast.error('Failed to remove concept'),
      })
    } else {
      // Open dialog to pick category + tags
      setSaveToBankOpen(true)
    }
  }

  const handleRegenerate = (mode: RegenerateMode) => {
    const labels: Record<RegenerateMode, string> = {
      full: 'full concept',
      recipe: 'recipe',
      image: 'image',
    }
    regenerateMutation.mutate(
      { concept, mode },
      {
        onSuccess: () =>
          toast.success(`Regenerated ${labels[mode]} successfully`),
        onError: () => toast.error(`Failed to regenerate ${labels[mode]}`),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{concept.title}</h1>
          <div className="flex flex-wrap gap-2">
            {concept.themeTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={concept.savedToBank ? 'default' : 'outline'}
            size="sm"
            onClick={handleSaveToBankClick}
          >
            {concept.savedToBank ? (
              <BookmarkCheck className="mr-1 h-4 w-4" />
            ) : (
              <Bookmark className="mr-1 h-4 w-4" />
            )}
            {concept.savedToBank ? 'Saved' : 'Save to Bank'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={regenerateMutation.isPending}
              >
                {regenerateMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 h-4 w-4" />
                )}
                {regenerateMutation.isPending
                  ? 'Regenerating...'
                  : 'Regenerate'}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRegenerate('full')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Full Concept
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRegenerate('recipe')}>
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Recipe Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRegenerate('image')}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Image Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sibling concepts navigation */}
      {siblingConcepts && siblingConcepts.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Other concepts:</span>
          {siblingConcepts.map((sibling, i) => (
            <Button
              key={sibling.id}
              variant={sibling.id === concept.id ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link to={`/concepts/${sibling.id}`}>Concept {i + 1}</Link>
            </Button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Image + Description */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative">
              <CakeImage
                src={concept.image.imageUrl}
                alt={concept.title}
                className="aspect-square w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {concept.description}
              </p>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-chart-4/20">
              <CardContent className="flex flex-col items-center gap-1 pt-4 pb-3">
                <Clock className="h-5 w-5 text-chart-4" />
                <span className="text-lg font-bold">
                  {concept.recipe.timeEstimateMinutes}m
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Total Time
                </span>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="flex flex-col items-center gap-1 pt-4 pb-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">
                  {concept.recipe.ingredients.length}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Ingredients
                </span>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardContent className="flex flex-col items-center gap-1 pt-4 pb-3">
                <ChefHat className="h-5 w-5 text-accent" />
                <span className="text-lg font-bold capitalize">
                  {concept.recipe.difficulty}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Difficulty
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Recipe + Costs */}
        <div className="space-y-4">
          <Tabs defaultValue="recipe">
            <TabsList className="w-full">
              <TabsTrigger value="recipe" className="flex-1">
                <ChefHat className="mr-1.5 h-4 w-4" />
                Recipe
              </TabsTrigger>
              <TabsTrigger value="shopping" className="flex-1">
                <ShoppingCart className="mr-1.5 h-4 w-4" />
                Shopping
              </TabsTrigger>
              <TabsTrigger value="extras" className="flex-1">
                <PartyPopper className="mr-1.5 h-4 w-4" />
                Extras
              </TabsTrigger>
            </TabsList>

            {/* Recipe Tab */}
            <TabsContent value="recipe" className="space-y-4">
              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {concept.recipe.ingredients.map((ing, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {ing.name}
                            </TableCell>
                            <TableCell>
                              {ing.quantity} {ing.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {ing.notes || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {concept.recipe.steps.map((step) => (
                    <div key={step.stepNumber} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {step.stepNumber}
                      </div>
                      <p className="text-sm leading-relaxed pt-0.5">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Equipment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Package className="mr-1.5 inline h-4 w-4" />
                    Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {concept.recipe.equipment.map((eq) => (
                      <Badge key={eq} variant="outline">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shopping Tab */}
            <TabsContent value="shopping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Estimated Total Cost
                  </CardTitle>
                  <CardDescription>
                    Based on average prices across store types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">
                    ${concept.shoppingPlan.totalEstimatedCost.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {concept.shoppingPlan.currency}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Ingredient Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Standard</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {concept.recipe.ingredients.map((ing) => {
                          const budgetCost =
                            concept.shoppingPlan.ingredientCosts.find(
                              (c) =>
                                c.ingredientName === ing.name &&
                                c.storeType === 'budget'
                            )
                          const stdCost =
                            concept.shoppingPlan.ingredientCosts.find(
                              (c) =>
                                c.ingredientName === ing.name &&
                                c.storeType === 'standard'
                            )
                          return (
                            <TableRow key={ing.name}>
                              <TableCell className="font-medium">
                                {ing.name}
                              </TableCell>
                              <TableCell>
                                ${budgetCost?.estimatedPrice.toFixed(2) || '—'}
                              </TableCell>
                              <TableCell>
                                ${stdCost?.estimatedPrice.toFixed(2) || '—'}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Store Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {concept.shoppingPlan.storeSuggestions.map((store) => (
                    <div
                      key={store.storeType}
                      className="flex items-start gap-3"
                    >
                      <Badge variant="outline" className="mt-0.5 capitalize">
                        {store.storeType}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {store.rationale}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Extras Tab */}
            <TabsContent value="extras" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Theme Addons & Decorations
                  </CardTitle>
                  <CardDescription>
                    Suggested extras to complete the theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Est. Price</TableHead>
                          <TableHead>Store</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {concept.extras.themeAddons.map((addon, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {addon.itemName}
                            </TableCell>
                            <TableCell>
                              ${addon.estimatedPrice.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {addon.storeSuggestion}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between">
                    <span className="font-medium">Total Extras</span>
                    <span className="font-bold text-accent">
                      ${concept.extras.addonsTotalEstimatedCost.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Save to Bank dialog */}
      <SaveToBankDialog
        open={saveToBankOpen}
        onOpenChange={setSaveToBankOpen}
        conceptId={concept.id}
        existingTags={concept.themeTags}
        existingNotes={concept.notes}
      />

      {/* Share dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        conceptId={concept.id}
      />
    </div>
  )
}

// --- Loading skeleton ---

function ConceptSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="mb-2 h-4 w-16" />
        <Skeleton className="h-8 w-64" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
