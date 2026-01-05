'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { usePageTrackerStore } from 'react-page-tracker'
import { cn } from '@/lib/utils/cn'
import { Button, ButtonProps } from '@/components/ui/button'
import { ChevronLeftIcon } from '@/components/Icons'

interface MagicBackButtonProps extends ButtonProps {
  backLink?: string
  showLabel?: boolean
  /** Called before navigation. Return false to prevent navigation. */
  onBeforeNavigate?: () => boolean
}

export const MagicBackButton = React.forwardRef<HTMLButtonElement, MagicBackButtonProps>(
  ({ className, onClick, children, backLink = '/', showLabel = true, onBeforeNavigate, ...props }, ref) => {
    const router = useRouter()
    const isFirstPage = usePageTrackerStore((state) => state.isFirstPage)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Check if navigation should be prevented
      if (onBeforeNavigate && !onBeforeNavigate()) {
        return
      }
      
      // Blur to clear focus/active state (prevents sticky highlight on mobile)
      e.currentTarget.blur()
      
      if (isFirstPage) {
        router.push(backLink)
      } else {
        router.back()
      }
      onClick?.(e)
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-9 gap-1.5 -ml-3', className)}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children ?? (
          <>
            <ChevronLeftIcon />
            {showLabel && <span className="hidden sm:inline">Back</span>}
          </>
        )}
      </Button>
    )
  }
)

MagicBackButton.displayName = 'MagicBackButton'

