// ============================================
// INTEGRATIONS CONFIG - Client-safe (no Prisma)
// ============================================
// ADDING NEW INTEGRATIONS:
// 1. Add field to IntegrationSettings in both Prisma schemas
// 2. Add config entry to the array below
// 3. Run: npm run db:push
// UI and API handle it automatically!
// ============================================

export type Integration = {
  key: string                     // DB field: 'googleAnalyticsId'
  label: string                   // UI label: 'Google Analytics'
  description: string             // Helper text
  placeholder?: string            // Input placeholder (optional for toggles)
  inputType: 'text' | 'password' | 'email' | 'toggle'
  envFallback?: string            // Env var name
}

export const integrations: Integration[] = [
  {
    key: 'googleAnalyticsId',
    label: 'Google Analytics',
    description: 'GA4 Measurement ID (e.g., G-XXXXXXXXXX)',
    placeholder: 'G-XXXXXXXXXX',
    inputType: 'text',
    envFallback: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  },
  {
    key: 'rb2bApiKey',
    label: 'RB2B',
    description: 'RB2B API key for visitor identification',
    placeholder: 'API key',
    inputType: 'password',
    envFallback: 'NEXT_PUBLIC_RB2B_API_KEY',
  },
  {
    key: 'contactEmail',
    label: 'Contact Email',
    description: 'Public contact email shown on the site',
    placeholder: 'contact@example.com',
    inputType: 'email',
    envFallback: 'NEXT_PUBLIC_CONTACT_EMAIL',
  },
  {
    key: 'anthropicApiKey',
    label: 'Anthropic',
    description: 'API key for Claude models (required for AI writing)',
    placeholder: 'sk-ant-...',
    inputType: 'password',
    envFallback: 'ANTHROPIC_API_KEY',
  },
  {
    key: 'openaiApiKey',
    label: 'OpenAI',
    description: 'API key for GPT models',
    placeholder: 'sk-...',
    inputType: 'password',
    envFallback: 'OPENAI_API_KEY',
  },
  // autoDraftEnabled toggle moved to AI Settings page
]


