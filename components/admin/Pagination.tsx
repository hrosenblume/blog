import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  position?: 'top' | 'bottom'
}

export function Pagination({ currentPage, totalPages, baseUrl, position = 'top' }: PaginationProps) {
  if (totalPages <= 1) return null

  const spacingClass = position === 'top' ? 'mb-4' : 'mt-4'

  const getPageUrl = (page: number) => `${baseUrl}?page=${page}`

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('ellipsis')
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <div className={cn("flex items-center justify-between px-4 py-3 bg-card rounded-lg shadow", spacingClass)}>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      
      <nav className="flex items-center gap-1">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={getPageUrl(currentPage - 1)}>← Prev</Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled>← Prev</Button>
        )}
        
        {/* Page numbers */}
        {getPageNumbers().map((page, i) => 
          page === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'ghost'}
              size="sm"
              asChild={page !== currentPage}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={getPageUrl(page)}>{page}</Link>
              )}
            </Button>
          )
        )}
        
        {/* Next button */}
        {currentPage < totalPages ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={getPageUrl(currentPage + 1)}>Next →</Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled>Next →</Button>
        )}
      </nav>
    </div>
  )
}
