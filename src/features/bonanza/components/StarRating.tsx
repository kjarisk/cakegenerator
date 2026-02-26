import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number // 1–5 or undefined
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const displayed = hovered ?? value ?? 0
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5',
        !readonly && 'cursor-pointer'
      )}
      onMouseLeave={() => !readonly && setHovered(null)}
      role={readonly ? undefined : 'radiogroup'}
      aria-label="Cake rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayed

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm',
              readonly
                ? 'cursor-default'
                : 'cursor-pointer hover:scale-110 transition-transform',
              !readonly && 'p-0'
            )}
            onMouseEnter={() => !readonly && setHovered(star)}
            onClick={() => {
              if (readonly) return
              // Allow toggling off if clicking same value
              onChange?.(star === value ? 0 : star)
            }}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            role={readonly ? undefined : 'radio'}
            aria-checked={star === value}
          >
            <Star
              className={cn(
                starSize,
                filled
                  ? 'fill-warm text-warm'
                  : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        )
      })}
      {!readonly && value && value > 0 && (
        <span className="ml-1 text-xs text-muted-foreground">{value}/5</span>
      )}
    </div>
  )
}
