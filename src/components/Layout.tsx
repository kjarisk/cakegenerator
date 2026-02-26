import { NavLink, Outlet } from 'react-router'
import {
  Cake,
  Home,
  Library,
  Plus,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { aiMode } from '@/lib/ai-service'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/create', label: 'Create Cake', icon: Plus },
  { to: '/bank', label: 'Cake Bank', icon: Library },
  { to: '/bonanza', label: 'Bonanza', icon: Calendar },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-6">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-glow-accent">
          <Cake className="h-5 w-5" />
          <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-accent animate-sparkle" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">CakeGen</h1>
          <p className="text-[10px] leading-none text-muted-foreground">
            Theme Cake Generator
          </p>
        </div>
      </div>

      <Separator className="mb-2 opacity-50" />

      {/* Nav links */}
      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/15 text-accent shadow-glow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive && 'text-accent'
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/50">CakeGen v1</p>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
              aiMode === 'live'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-muted text-muted-foreground/60'
            )}
          >
            <Zap className="h-2.5 w-2.5" />
            AI: {aiMode === 'live' ? 'Live' : 'Mock'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function Component() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dark flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border/60 bg-sidebar md:block">
        <NavContent />
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex flex-1 flex-col">
        <header className="glass-strong sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/40 px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Cake className="h-5 w-5 text-accent" />
              <Sparkles className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 text-accent animate-sparkle" />
            </div>
            <span className="font-bold">CakeGen</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
