import { Link } from 'react-router'
import {
  Library,
  Search,
  Plus,
  FolderOpen,
  Tag,
  Trash2,
  Cake,
  Sparkles,
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
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  useThemeCategoriesQuery,
  useSavedConceptsQuery,
  useConceptsByCategoryQuery,
  useDeleteThemeCategoryMutation,
  useRemoveConceptFromBankMutation,
} from '../api/use-cake-bank-queries'
import { useCakeBankStore } from '../state/cake-bank-store'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import type { CakeConcept } from '@/lib/types'

export function Component() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    isCreateCategoryOpen,
    setCreateCategoryOpen,
  } = useCakeBankStore()

  const { data: categories, isLoading: categoriesLoading } =
    useThemeCategoriesQuery()
  const { data: allSavedConcepts, isLoading: conceptsLoading } =
    useSavedConceptsQuery()
  const { data: categoryFilteredConcepts } = useConceptsByCategoryQuery(
    selectedCategoryId || ''
  )

  const deleteCategoryMutation = useDeleteThemeCategoryMutation()
  const removeFromBankMutation = useRemoveConceptFromBankMutation()

  // Determine which concepts to display
  const baseConcepts = selectedCategoryId
    ? categoryFilteredConcepts
    : allSavedConcepts
  const displayConcepts = filterConcepts(baseConcepts || [], searchQuery)

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id)
      if (selectedCategoryId === id) setSelectedCategoryId(null)
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
    }
  }

  const handleRemoveFromBank = async (conceptId: string) => {
    try {
      await removeFromBankMutation.mutateAsync(conceptId)
      toast.success('Removed from Cake Bank')
    } catch {
      toast.error('Failed to remove concept')
    }
  }

  const isLoading = categoriesLoading || conceptsLoading

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Cake Bank</h1>
        </div>
        <p className="text-muted-foreground">
          Browse and search your saved cake concepts by theme.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar: categories */}
        <div className="w-full shrink-0 lg:w-60">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCreateCategoryOpen(true)}
                  aria-label="Create category"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              {categoriesLoading ? (
                <div className="space-y-2 px-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <nav className="flex flex-col gap-0.5">
                    {/* All saved */}
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${
                        selectedCategoryId === null
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <span className="truncate">All Saved</span>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[10px] px-1.5 py-0"
                      >
                        {allSavedConcepts?.length ?? 0}
                      </Badge>
                    </button>

                    {categories?.map((cat) => (
                      <div
                        key={cat.id}
                        className="group flex items-center gap-0.5"
                      >
                        <button
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left min-w-0 ${
                            selectedCategoryId === cat.id
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Tag className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{cat.name}</span>
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[10px] px-1.5 py-0"
                          >
                            {cat.cakeConceptIds.length}
                          </Badge>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteCategory(cat.id)}
                          aria-label={`Delete category ${cat.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    {categories?.length === 0 && (
                      <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                        No categories yet. Create one to organize your cakes.
                      </p>
                    )}
                  </nav>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content: search + concept grid */}
        <div className="flex-1 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : displayConcepts.length === 0 ? (
            <EmptyState
              hasSearch={searchQuery.length > 0}
              hasCategory={selectedCategoryId !== null}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {displayConcepts.map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  onRemove={() => handleRemoveFromBank(concept.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create category dialog */}
      <CreateCategoryDialog
        open={isCreateCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />
    </div>
  )
}

// --- Sub-components ---

function ConceptCard({
  concept,
  onRemove,
}: {
  concept: CakeConcept
  onRemove: () => void
}) {
  return (
    <Card className="group overflow-hidden hover-glow transition-all duration-200">
      <Link to={`/concepts/${concept.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={concept.image.imageUrl}
            alt={concept.title}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card to-transparent" />
        </div>
      </Link>
      <CardHeader className="pb-2">
        <Link to={`/concepts/${concept.id}`}>
          <CardTitle className="text-sm font-semibold leading-tight group-hover:text-accent transition-colors">
            {concept.title}
          </CardTitle>
        </Link>
        <CardDescription className="line-clamp-2 text-xs">
          {concept.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {concept.themeTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
              {tag}
            </Badge>
          ))}
          {concept.themeTags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5">
              +{concept.themeTags.length - 3}
            </Badge>
          )}
        </div>
        <Separator className="mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{concept.recipe.difficulty}</span>
          <span>{concept.recipe.timeEstimateMinutes}m</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
            onClick={(e) => {
              e.preventDefault()
              onRemove()
            }}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  hasSearch,
  hasCategory,
}: {
  hasSearch: boolean
  hasCategory: boolean
}) {
  if (hasSearch) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No matching concepts</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term or clear the filter.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasCategory) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium">Category is empty</p>
            <p className="text-sm text-muted-foreground">
              Save cake concepts to this category from the concept detail page.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 via-primary/10 to-chart-4/10 shadow-glow-sm">
            <Cake className="h-10 w-10 text-accent/70" />
          </div>
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-accent animate-sparkle" />
        </div>
        <div>
          <p className="text-lg font-medium">Your Cake Bank is empty</p>
          <p className="text-sm text-muted-foreground">
            Generate cake concepts and save your favorites to build your
            collection.
          </p>
        </div>
        <Button
          asChild
          className="bg-accent hover:bg-accent/90 shadow-glow-accent"
        >
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" />
            Generate Cake Concept
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// --- Helpers ---

function filterConcepts(concepts: CakeConcept[], query: string): CakeConcept[] {
  if (!query.trim()) return concepts
  const lower = query.toLowerCase()
  return concepts.filter(
    (c) =>
      c.title.toLowerCase().includes(lower) ||
      c.themeTags.some((t) => t.toLowerCase().includes(lower)) ||
      c.description.toLowerCase().includes(lower)
  )
}
