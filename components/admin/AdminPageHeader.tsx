import { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="shrink-0">
        <h1 className="text-section font-bold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}




