import Parser from 'rss-parser'

export interface RssArticle {
  title: string
  url: string
  summary: string | null
  publishedAt: Date | null
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; AutoDraftBot/1.0)',
  },
})

/**
 * Fetch and parse multiple RSS feeds, combining all articles.
 */
export async function fetchRssFeeds(feedUrls: string[]): Promise<RssArticle[]> {
  const articles: RssArticle[] = []

  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url)
      
      for (const item of feed.items) {
        if (!item.title || !item.link) continue
        
        articles.push({
          title: item.title,
          url: item.link,
          summary: item.contentSnippet || item.content || null,
          publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        })
      }
    } catch (error) {
      console.error(`Failed to fetch RSS feed: ${url}`, error)
      // Continue with other feeds
    }
  }

  return articles
}

