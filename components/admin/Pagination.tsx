import { cn } from '@/lib/utils/cn'
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  position?: 'top' | 'bottom'
}

export function Pagination({ currentPage, totalPages, baseUrl, position = 'top' }: PaginationProps) {
  if (totalPages <= 1) return null

  // Only add spacing for bottom position (top is inline with header)
  const spacingClass = position === 'bottom' ? 'mt-4' : ''

  const getPageUrl = (page: number) => `${baseUrl}?page=${page}`

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    
    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('ellipsis-start')
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end')
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <PaginationRoot className={cn("justify-end", spacingClass)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={currentPage > 1 ? getPageUrl(currentPage - 1) : undefined}
            className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        
        {getPageNumbers().map((page) => 
          typeof page === 'string' ? (
            <PaginationItem key={page}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink 
                href={getPageUrl(page)} 
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        
        <PaginationItem>
          <PaginationNext 
            href={currentPage < totalPages ? getPageUrl(currentPage + 1) : undefined}
            className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  )
}
