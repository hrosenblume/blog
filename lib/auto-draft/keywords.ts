import type { RssArticle } from './rss'

/**
 * Filter articles by keyword matching.
 * Case-insensitive substring match on title and summary.
 */
export function filterByKeywords(
  articles: RssArticle[],
  keywords: string[]
): RssArticle[] {
  if (keywords.length === 0) return articles

  const lowerKeywords = keywords.map(k => k.toLowerCase().trim())

  return articles.filter(article => {
    const searchText = `${article.title} ${article.summary || ''}`.toLowerCase()
    return lowerKeywords.some(keyword => searchText.includes(keyword))
  })
}

