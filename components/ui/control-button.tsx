import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

/**
 * Subtle control button for toolbars and input controls.
 * Matches the muted metadata text style (text-sm text-muted-foreground).
 */
export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ className, active, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1 text-sm transition-colors focus:outline-none",
          disabled
            ? "text-muted-foreground/30 cursor-not-allowed"
            : active
              ? "text-blue-500 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ControlButton.displayName = 'ControlButton'


