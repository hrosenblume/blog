import { ITEMS_PER_PAGE } from './constants'

interface PaginationParams {
  page?: string
}

interface PaginatedResult<T> {
  data: T[]
  total: number
  currentPage: number
  totalPages: number
  skip: number
  take: number
}

/**
 * Shared pagination helper for admin pages.
 * Handles parsing page params, calculating skip/take, and returning pagination metadata.
 */
export async function getPaginatedData<T>(
  searchParams: Promise<PaginationParams>,
  fetcher: (skip: number, take: number) => Promise<T[]>,
  counter: () => Promise<number>,
  perPage: number = ITEMS_PER_PAGE
): Promise<PaginatedResult<T>> {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * perPage
  
  const [data, total] = await Promise.all([
    fetcher(skip, perPage),
    counter(),
  ])
  
  return {
    data,
    total,
    currentPage,
    totalPages: Math.ceil(total / perPage),
    skip,
    take: perPage,
  }
}

/**
 * Simple pagination params parser for cases where you need more control.
 */
export async function parsePaginationParams(
  searchParams: Promise<PaginationParams>,
  perPage: number = ITEMS_PER_PAGE
): Promise<{ currentPage: number; skip: number; take: number }> {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const skip = (currentPage - 1) * perPage
  
  return { currentPage, skip, take: perPage }
}

