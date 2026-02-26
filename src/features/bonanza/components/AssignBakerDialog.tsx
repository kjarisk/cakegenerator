// =============================================================================
// AssignBakerDialog — Assign a baker to a specific week
// Called from the calendar when clicking on an unassigned week.
// Also allows setting cake day and cake name.
// =============================================================================

import { useState } from 'react'
import { ChefHat } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  useAssignBakerMutation,
  useCreateUserMutation,
} from '../api/use-bonanza-queries'
import type { User, DayOfWeek } from '@/lib/types'
import { DAY_NAMES } from '@/lib/types'

interface AssignBakerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  weekStartDate: string
  users: User[]
  currentUserId?: string // pre-fill if re-assigning
  currentCakeDay?: DayOfWeek
  currentCakeName?: string
}

const DAY_OPTIONS: DayOfWeek[] = [1, 2, 3, 4, 5, 0, 6] // Mon-Sun order

export function AssignBakerDialog({
  open,
  onOpenChange,
  scheduleId,
  weekStartDate,
  users,
  currentUserId,
  currentCakeDay,
  currentCakeName,
}: AssignBakerDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState(currentUserId || '')
  const [newUserName, setNewUserName] = useState('')
  const [cakeDay, setCakeDay] = useState<DayOfWeek>(currentCakeDay ?? 5)
  const [cakeName, setCakeName] = useState(currentCakeName || '')

  const assignBakerMutation = useAssignBakerMutation()
  const createUserMutation = useCreateUserMutation()

  const weekDate = new Date(weekStartDate + 'T00:00:00')
  const weekLabel = weekDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleSubmit = async () => {
    let userId = selectedUserId

    // Create new user if needed
    if (!userId && newUserName.trim()) {
      try {
        const user = await createUserMutation.mutateAsync({
          displayName: newUserName.trim(),
        })
        userId = user.id
      } catch {
        toast.error('Failed to create user')
        return
      }
    }

    if (!userId) {
      toast.error('Please select or create a team member')
      return
    }

    try {
      await assignBakerMutation.mutateAsync({
        scheduleId,
        weekStartDate,
        userId,
        cakeDay,
        cakeName: cakeName.trim() || undefined,
      })
      toast.success('Baker assigned!')
      resetAndClose()
    } catch {
      toast.error('Failed to assign baker')
    }
  }

  const resetAndClose = () => {
    setSelectedUserId('')
    setNewUserName('')
    setCakeDay(5)
    setCakeName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-warm" />
            Assign Baker
          </DialogTitle>
          <DialogDescription>
            Week of <span className="font-semibold">{weekLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Baker selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Baker</label>
            {users.length > 0 && (
              <Select
                value={selectedUserId}
                onValueChange={(v) => {
                  setSelectedUserId(v)
                  setNewUserName('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>or add a new member:</span>
            </div>
            <Input
              placeholder="New member name"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value)
                if (e.target.value) setSelectedUserId('')
              }}
            />
          </div>

          <Separator />

          {/* Cake day override */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cake Day</label>
            <Select
              value={String(cakeDay)}
              onValueChange={(v) => setCakeDay(Number(v) as DayOfWeek)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {DAY_NAMES[day]}{' '}
                    {day === 5 && (
                      <span className="text-muted-foreground">(default)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cakeDay !== 5 && (
              <p className="text-xs text-warm">
                Not the usual Friday — this will show a heads-up!
              </p>
            )}
          </div>

          {/* Cake name / theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Cake Theme{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              placeholder="e.g., Chocolate Lava, Space Theme..."
              value={cakeName}
              onChange={(e) => setCakeName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              assignBakerMutation.isPending || createUserMutation.isPending
            }
          >
            {assignBakerMutation.isPending ? 'Assigning...' : 'Assign Baker'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
