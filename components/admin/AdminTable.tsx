import { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface AdminTableColumn {
  header: string
  className?: string
  maxWidth?: string
}

export interface AdminTableRow {
  key: string
  cells: ReactNode[]
  actions?: ReactNode
  mobileLabel?: ReactNode
  mobileMeta?: string
  mobileBadge?: ReactNode
}

interface AdminTableProps {
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  emptyMessage?: string
  showActions?: boolean
}

/** Mobile list item template */
function MobileItem({ row }: { row: AdminTableRow }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-5">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{row.mobileLabel}</span>
          {row.mobileBadge}
        </div>
        {row.mobileMeta && (
          <p className="text-sm text-muted-foreground truncate">{row.mobileMeta}</p>
        )}
      </div>
      {row.actions}
    </div>
  )
}

/** Desktop/fallback table template */
function DataTable({
  columns,
  rows,
  showActions,
  withTruncation = false,
}: {
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  showActions: boolean
  withTruncation?: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.header} className={col.className}>
              {col.header}
            </TableHead>
          ))}
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            {row.cells.map((cell, i) => {
              const col = columns[i]
              const needsTruncate = withTruncation && col?.maxWidth
              return (
                <TableCell key={i} className={col?.className}>
                  {needsTruncate ? (
                    <span className={`block truncate ${col.maxWidth}`}>{cell}</span>
                  ) : (
                    cell
                  )}
                </TableCell>
              )
            })}
            {showActions && row.actions && (
              <TableCell className="text-right">{row.actions}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function AdminTable({
  columns,
  rows,
  emptyMessage = 'No items found.',
  showActions = true,
}: AdminTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">{emptyMessage}</div>
    )
  }

  const hasMobileLayout = rows.some((row) => row.mobileLabel !== undefined)

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <DataTable columns={columns} rows={rows} showActions={showActions} withTruncation />
      </div>

      {/* Mobile */}
      {hasMobileLayout ? (
        <div className="md:hidden divide-y rounded-md border overflow-hidden bg-background">
          {rows.map((row) => (
            <MobileItem key={row.key} row={row} />
          ))}
        </div>
      ) : (
        <div className="md:hidden rounded-md border overflow-hidden overflow-x-auto">
          <DataTable columns={columns} rows={rows} showActions={showActions} />
        </div>
      )}
    </>
  )
}
