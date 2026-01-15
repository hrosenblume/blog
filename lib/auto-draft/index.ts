import { cms } from '@/lib/cms'
import { getRandomShape } from '@/lib/polyhedra/shapes'

// Re-export types for existing consumers
export type { GenerationResult } from 'autoblogger'

/**
 * Run auto-draft for one or all active topics.
 * Wraps autoblogger's runAutoDraft with blog-specific polyhedra shape generation.
 */
export async function runAutoDraft(
  topicId?: string,
  skipFrequencyCheck = false
) {
  return cms.autoDraft.run(topicId, skipFrequencyCheck)
}
