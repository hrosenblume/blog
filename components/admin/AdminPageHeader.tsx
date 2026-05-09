import { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="shrink-0">
        <h1 className="text-section font-bold">{title}</h1>
        {subtitle && (
          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  )
}




