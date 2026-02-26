// =============================================================================
// CakeImage — Image component with DALL-E URL expiry fallback
// Shows a gradient placeholder with cake emoji when image fails to load.
// =============================================================================

import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CakeImageProps {
  src: string
  alt: string
  className?: string
}

export function CakeImage({ src, alt, className }: CakeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/80 to-pink-600/80',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="text-5xl">🎂</span>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
          <ImageOff className="h-3 w-3" />
          Image expired
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
