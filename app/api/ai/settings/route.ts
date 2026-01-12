import { NextRequest, NextResponse } from 'next/server'
import { withSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AI_MODELS } from '@/lib/ai/models'
import { 
  DEFAULT_GENERATE_TEMPLATE, 
  DEFAULT_CHAT_TEMPLATE, 
  DEFAULT_REWRITE_TEMPLATE,
  DEFAULT_AUTO_DRAFT_TEMPLATE,
  DEFAULT_PLAN_TEMPLATE,
  DEFAULT_PLAN_RULES,
  DEFAULT_EXPAND_PLAN_TEMPLATE,
} from '@/lib/ai/system-prompt'

// GET /api/ai/settings - Get current AI settings
export const GET = withSession(async () => {
  // Upsert to ensure settings always exist
  const settings = await prisma.aISettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      rules: '',
      chatRules: '',
      defaultModel: 'claude-sonnet',
    },
  })

  return NextResponse.json({
    rules: settings.rules,
    chatRules: settings.chatRules,
    rewriteRules: settings.rewriteRules,
    autoDraftRules: settings.autoDraftRules,
    planRules: settings.planRules,
    autoDraftWordCount: settings.autoDraftWordCount ?? 800,
    defaultModel: settings.defaultModel,
    generateTemplate: settings.generateTemplate,
    chatTemplate: settings.chatTemplate,
    rewriteTemplate: settings.rewriteTemplate,
    autoDraftTemplate: settings.autoDraftTemplate,
    planTemplate: settings.planTemplate,
    expandPlanTemplate: settings.expandPlanTemplate,
    defaultGenerateTemplate: DEFAULT_GENERATE_TEMPLATE,
    defaultChatTemplate: DEFAULT_CHAT_TEMPLATE,
    defaultRewriteTemplate: DEFAULT_REWRITE_TEMPLATE,
    defaultAutoDraftTemplate: DEFAULT_AUTO_DRAFT_TEMPLATE,
    defaultPlanRules: DEFAULT_PLAN_RULES,
    defaultPlanTemplate: DEFAULT_PLAN_TEMPLATE,
    defaultExpandPlanTemplate: DEFAULT_EXPAND_PLAN_TEMPLATE,
    availableModels: AI_MODELS.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      hasNativeSearch: m.searchModel !== null,
    })),
  })
})

// PATCH /api/ai/settings - Update AI settings
export const PATCH = withSession(async (request: NextRequest) => {
  const body = await request.json()
  
  const updateData: { 
    rules?: string
    chatRules?: string
    rewriteRules?: string
    autoDraftRules?: string
    planRules?: string
    autoDraftWordCount?: number
    defaultModel?: string
    generateTemplate?: string | null
    chatTemplate?: string | null
    rewriteTemplate?: string | null
    autoDraftTemplate?: string | null
    planTemplate?: string | null
    expandPlanTemplate?: string | null
  } = {}

  if (typeof body.rules === 'string') {
    updateData.rules = body.rules
  }

  if (typeof body.chatRules === 'string') {
    updateData.chatRules = body.chatRules
  }

  if (typeof body.rewriteRules === 'string') {
    updateData.rewriteRules = body.rewriteRules
  }

  if (typeof body.autoDraftRules === 'string') {
    updateData.autoDraftRules = body.autoDraftRules
  }

  if (typeof body.planRules === 'string') {
    updateData.planRules = body.planRules
  }

  if (typeof body.autoDraftWordCount === 'number') {
    updateData.autoDraftWordCount = body.autoDraftWordCount
  }

  if (typeof body.defaultModel === 'string') {
    // Validate model exists
    const validModel = AI_MODELS.find(m => m.id === body.defaultModel)
    if (!validModel) {
      return NextResponse.json(
        { error: `Invalid model: ${body.defaultModel}` },
        { status: 400 }
      )
    }
    updateData.defaultModel = body.defaultModel
  }

  // Template fields: null means reset to default, string means custom
  if (body.generateTemplate !== undefined) {
    updateData.generateTemplate = body.generateTemplate
  }

  if (body.chatTemplate !== undefined) {
    updateData.chatTemplate = body.chatTemplate
  }

  if (body.rewriteTemplate !== undefined) {
    updateData.rewriteTemplate = body.rewriteTemplate
  }

  if (body.autoDraftTemplate !== undefined) {
    updateData.autoDraftTemplate = body.autoDraftTemplate
  }

  if (body.planTemplate !== undefined) {
    updateData.planTemplate = body.planTemplate
  }

  if (body.expandPlanTemplate !== undefined) {
    updateData.expandPlanTemplate = body.expandPlanTemplate
  }

  const settings = await prisma.aISettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: {
      id: 'default',
      rules: updateData.rules || '',
      chatRules: updateData.chatRules || '',
      rewriteRules: updateData.rewriteRules,
      autoDraftRules: updateData.autoDraftRules,
      planRules: updateData.planRules,
      autoDraftWordCount: updateData.autoDraftWordCount,
      defaultModel: updateData.defaultModel || 'claude-sonnet',
      generateTemplate: updateData.generateTemplate,
      chatTemplate: updateData.chatTemplate,
      rewriteTemplate: updateData.rewriteTemplate,
      autoDraftTemplate: updateData.autoDraftTemplate,
      planTemplate: updateData.planTemplate,
      expandPlanTemplate: updateData.expandPlanTemplate,
    },
  })

  return NextResponse.json({
    rules: settings.rules,
    chatRules: settings.chatRules,
    rewriteRules: settings.rewriteRules,
    autoDraftRules: settings.autoDraftRules,
    planRules: settings.planRules,
    autoDraftWordCount: settings.autoDraftWordCount ?? 800,
    defaultModel: settings.defaultModel,
    generateTemplate: settings.generateTemplate,
    chatTemplate: settings.chatTemplate,
    rewriteTemplate: settings.rewriteTemplate,
    autoDraftTemplate: settings.autoDraftTemplate,
    planTemplate: settings.planTemplate,
    expandPlanTemplate: settings.expandPlanTemplate,
  })
})
