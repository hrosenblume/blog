import { prisma } from '@/lib/db'
import { generate } from '@/lib/ai/provider'
import { resolveModel } from '@/lib/ai/models'
import { getStyleContext, buildNewsEssayPrompt } from '@/lib/ai/system-prompt'
import { parseGeneratedContent } from '@/lib/ai/parse'
import { getRandomShape } from '@/lib/polyhedra/shapes'
import { fetchRssFeeds, type RssArticle } from './rss'
import { filterByKeywords } from './keywords'
import { generateUniqueSlug } from './slugs'

export interface GenerationResult {
  topicId: string
  topicName: string
  generated: number
  skipped: number
}

/**
 * Check if a topic should run based on its frequency and lastRunAt.
 */
function shouldRunTopic(topic: { frequency: string; lastRunAt: Date | null }): boolean {
  if (topic.frequency === 'manual') return false
  if (!topic.lastRunAt) return true

  const now = new Date()
  const lastRun = new Date(topic.lastRunAt)
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)

  if (topic.frequency === 'daily') return hoursSinceLastRun >= 23
  if (topic.frequency === 'weekly') return hoursSinceLastRun >= 167 // ~7 days
  
  return true
}

/**
 * Deduplicate articles against existing NewsItems.
 */
async function deduplicateArticles(
  articles: RssArticle[],
  topicId: string
): Promise<RssArticle[]> {
  const existingUrls = await prisma.newsItem.findMany({
    where: { topicId },
    select: { url: true },
  })
  
  const urlSet = new Set(existingUrls.map(n => n.url))
  return articles.filter(a => !urlSet.has(a.url))
}

/**
 * Generate an essay from an article using AI.
 * The system prompt (from buildNewsEssayPrompt) includes all instructions,
 * word count, and article details. The user prompt just triggers generation.
 */
async function generateEssayFromArticle(
  article: RssArticle,
  topicName: string,
  essayFocus?: string | null
): Promise<{ title: string; subtitle: string | null; markdown: string }> {
  const context = await getStyleContext()
  const systemPrompt = buildNewsEssayPrompt(
    { title: article.title, summary: article.summary || '', url: article.url },
    topicName,
    context,
    essayFocus
  )
  
  // Resolve the default model
  const model = await resolveModel(undefined, async () => {
    const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
    return settings?.defaultModel || null
  })

  // User prompt is minimal since all instructions are in the system prompt
  const userPrompt = 'Write the essay now.'
  
  const result = await generate(model.id, systemPrompt, userPrompt, 4096)
  const parsed = parseGeneratedContent(result.text)

  return {
    title: parsed.title || article.title,
    subtitle: parsed.subtitle || null,
    markdown: parsed.body,
  }
}

/**
 * Run auto-draft for one or all active topics.
 * @param topicId - Optional: run for a specific topic only
 * @param skipFrequencyCheck - If true, ignore frequency settings (for manual trigger)
 */
export async function runAutoDraft(
  topicId?: string,
  skipFrequencyCheck = false
): Promise<GenerationResult[]> {
  // Check master toggle first
  const integrationSettings = await prisma.integrationSettings.findUnique({
    where: { id: 'default' },
  }) as { autoDraftEnabled?: boolean } | null
  if (!integrationSettings?.autoDraftEnabled) {
    console.log('Auto-draft is disabled. Skipping.')
    return []
  }

  const topics = topicId
    ? await prisma.topicSubscription.findMany({ where: { id: topicId, isActive: true } })
    : await prisma.topicSubscription.findMany({ where: { isActive: true } })

  const results: GenerationResult[] = []

  for (const topic of topics) {
    // Skip if frequency check applies and topic shouldn't run
    if (!skipFrequencyCheck && !shouldRunTopic(topic)) {
      continue
    }

    try {
      // 1. Fetch RSS feeds
      const feedUrls: string[] = JSON.parse(topic.rssFeeds)
      const articles = await fetchRssFeeds(feedUrls)

      // 2. Filter by keywords (if enabled)
      const keywords: string[] = JSON.parse(topic.keywords)
      const relevant = topic.useKeywordFilter
        ? filterByKeywords(articles, keywords)
        : articles

      // 3. Deduplicate (skip URLs already in NewsItem)
      const newArticles = await deduplicateArticles(relevant, topic.id)

      // 4. Generate essays (up to maxPerPeriod)
      const toGenerate = newArticles.slice(0, topic.maxPerPeriod)
      let generated = 0

      for (const article of toGenerate) {
        try {
          // Create NewsItem first
          const newsItem = await prisma.newsItem.create({
            data: {
              topicId: topic.id,
              url: article.url,
              title: article.title,
              summary: article.summary,
              publishedAt: article.publishedAt,
              status: 'pending',
            },
          })

          // Generate essay with AI
          const essay = await generateEssayFromArticle(article, topic.name, topic.essayFocus)

          // Generate unique slug
          const slug = await generateUniqueSlug(essay.title)

          // Create suggested post
          const post = await prisma.post.create({
            data: {
              title: essay.title,
              subtitle: essay.subtitle,
              slug,
              markdown: essay.markdown,
              status: 'suggested',
              sourceUrl: article.url,
              topicId: topic.id,
              polyhedraShape: getRandomShape(),
            },
          })

          // Link NewsItem to Post
          await prisma.newsItem.update({
            where: { id: newsItem.id },
            data: { postId: post.id, status: 'generated' },
          })

          generated++
        } catch (articleError) {
          console.error(`Failed to process article: ${article.title}`, articleError)
          // Continue with other articles
        }
      }

      // 5. Update lastRunAt
      await prisma.topicSubscription.update({
        where: { id: topic.id },
        data: { lastRunAt: new Date() },
      })

      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated,
        skipped: relevant.length - generated,
      })
    } catch (topicError) {
      console.error(`Failed to process topic: ${topic.name}`, topicError)
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated: 0,
        skipped: 0,
      })
    }
  }

  return results
}

