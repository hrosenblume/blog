import { ReactNode } from 'react'
import {
  tableHeaderClass,
  tableCellClass,
  tableRowHoverClass,
  cardClass,
  emptyStateClass,
  mobileCardClass,
} from '@/lib/styles'

export interface AdminTableColumn {
  header: string
  className?: string
  /** Max width for truncation (e.g., 'max-w-[200px]') */
  maxWidth?: string
}

export interface AdminTableRow {
  key: string
  cells: ReactNode[]
  actions?: ReactNode
  // Mobile card data
  mobileTitle?: ReactNode
  mobileSubtitle?: ReactNode
  mobileBadge?: ReactNode
  mobileMeta?: ReactNode
  mobileActions?: ReactNode
}

interface AdminTableProps {
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  emptyMessage?: string
  showActions?: boolean
}

/**
 * A reusable admin table component that works with Server Components.
 * Pass pre-rendered ReactNode content instead of render functions.
 */
export function AdminTable({
  columns,
  rows,
  emptyMessage = 'No items found.',
  showActions = true,
}: AdminTableProps) {
  if (rows.length === 0) {
    return <div className={emptyStateClass}>{emptyMessage}</div>
  }

  const hasMobileCards = rows.some(row => row.mobileTitle !== undefined)

  return (
    <>
      {/* Desktop table */}
      <div className={`hidden md:block ${cardClass} overflow-hidden`}>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={`${tableHeaderClass} ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th className={`${tableHeaderClass} text-right`}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.key} className={tableRowHoverClass}>
                {row.cells.map((cell, i) => {
                  const col = columns[i]
                  const maxWidthClass = col?.maxWidth || ''
                  return (
                    <td key={i} className={`${tableCellClass} ${col?.className || ''}`}>
                      {maxWidthClass ? (
                        <span className={`block truncate ${maxWidthClass}`}>{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  )
                })}
                {showActions && row.actions && (
                  <td className={`${tableCellClass} text-right space-x-2`}>
                    {row.actions}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {hasMobileCards ? (
        <div className="md:hidden space-y-4">
          {rows.map((row) => (
            <div key={row.key} className={mobileCardClass}>
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{row.mobileTitle}</p>
                  {row.mobileSubtitle && (
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {row.mobileSubtitle}
                    </p>
                  )}
                </div>
                {row.mobileBadge}
              </div>
              {row.mobileMeta && (
                <p className="text-xs text-muted-foreground mb-3">
                  {row.mobileMeta}
                </p>
              )}
              {row.mobileActions && (
                <div className="flex gap-2 flex-wrap">{row.mobileActions}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Fallback: simplified table on mobile */
        <div className={`md:hidden ${cardClass} overflow-hidden overflow-x-auto`}>
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                {columns.map((col) => (
                  <th key={col.header} className={tableHeaderClass}>
                    {col.header}
                  </th>
                ))}
                {showActions && (
                  <th className={`${tableHeaderClass} text-right`}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.key} className={tableRowHoverClass}>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={tableCellClass}>
                      {cell}
                    </td>
                  ))}
                  {showActions && row.actions && (
                    <td className={`${tableCellClass} text-right space-x-2`}>
                      {row.actions}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
