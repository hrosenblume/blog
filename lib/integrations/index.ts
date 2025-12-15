// Server-only integrations utilities
// Re-exports config for convenience, adds Prisma-dependent functions

import { prisma } from '@/lib/db'
import { integrations } from './config'

// Re-export config for server components
export { integrations, type Integration } from './config'

export type IntegrationSettingsData = {
  googleAnalyticsId: string | null
  rb2bApiKey: string | null
  contactEmail: string | null
}

/**
 * Get integration settings with env var fallbacks.
 * DB values take precedence over env vars.
 * Built dynamically from integrations config array.
 * 
 * NOTE: This is server-only. For client components, import config from './config'
 */
export async function getIntegrationSettings(): Promise<IntegrationSettingsData> {
  const settings = await prisma.integrationSettings.findUnique({
    where: { id: 'default' }
  })

  // Build result object dynamically from config
  const result: Record<string, string | null> = {}
  for (const { key, envFallback } of integrations) {
    const dbValue = settings?.[key as keyof typeof settings] as string | null | undefined
    const envValue = envFallback ? process.env[envFallback] : undefined
    result[key] = dbValue || envValue || null
  }

  return result as IntegrationSettingsData
}


