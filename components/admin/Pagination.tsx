import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

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

  const buttonBase = 'px-3 py-2 text-sm font-medium rounded-md transition-colors'
  const buttonActive = 'bg-blue-600 text-white'
  const buttonInactive = 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
  const buttonDisabled = 'text-gray-400 dark:text-gray-600 cursor-not-allowed'

  return (
    <div className={cn("flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow", spacingClass)}>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      
      <nav className="flex items-center gap-1">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className={cn(buttonBase, buttonInactive)}
          >
            ← Prev
          </Link>
        ) : (
          <span className={cn(buttonBase, buttonDisabled)}>← Prev</span>
        )}
        
        {/* Page numbers */}
        {getPageNumbers().map((page, i) => 
          page === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={cn(buttonBase, page === currentPage ? buttonActive : buttonInactive)}
            >
              {page}
            </Link>
          )
        )}
        
        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className={cn(buttonBase, buttonInactive)}
          >
            Next →
          </Link>
        ) : (
          <span className={cn(buttonBase, buttonDisabled)}>Next →</span>
        )}
      </nav>
    </div>
  )
}

