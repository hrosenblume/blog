/**
 * Auto-Draft Cron Script
 * 
 * Fetches RSS feeds for active topic subscriptions and generates essay drafts.
 * Run with: npx tsx --env-file=.env.local scripts/auto-draft.ts
 * 
 * Schedule via cron:
 *   0 6 * * * cd /var/www/blog && npx tsx scripts/auto-draft.ts >> /var/log/blog/auto-draft.log 2>&1
 */

// Load environment variables
import 'dotenv/config'

// Import after dotenv so DATABASE_URL is available
import { cms } from '../lib/cms'

async function main() {
  const startTime = new Date()
  console.log(`[${startTime.toISOString()}] Starting auto-draft...`)
  
  try {
    const results = await cms.autoDraft.run()
    
    if (results.length === 0) {
      console.log('  No active topics to process.')
    } else {
      let totalGenerated = 0
      let totalSkipped = 0
      
      for (const r of results) {
        console.log(`  ${r.topicName}: generated ${r.generated}, skipped ${r.skipped}`)
        totalGenerated += r.generated
        totalSkipped += r.skipped
      }
      
      console.log(`  ---`)
      console.log(`  Total: ${totalGenerated} essays generated, ${totalSkipped} articles skipped`)
    }
    
    const endTime = new Date()
    const duration = (endTime.getTime() - startTime.getTime()) / 1000
    console.log(`[${endTime.toISOString()}] Done in ${duration.toFixed(1)}s`)
    
    process.exit(0)
  } catch (error) {
    console.error('Auto-draft failed:', error)
    process.exit(1)
  }
}

main()

