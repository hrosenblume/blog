import { cn } from '@/lib/utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  loading = false, 
  children, 
  className,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 inline-flex items-center gap-2',
        variant === 'primary' && 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90',
        variant === 'secondary' && 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
}



