export interface RevisionSummary {
  id: string
  title: string | null
  createdAt: string
}

export interface RevisionFull extends RevisionSummary {
  subtitle: string | null
  markdown: string
  polyhedraShape: string | null
}

export interface StashedContent {
  title: string
  subtitle: string
  markdown: string
  polyhedraShape: string
}

export interface RevisionState {
  list: RevisionSummary[]
  loading: boolean
  previewLoading: boolean
  previewing: RevisionFull | null
  fetch: () => Promise<void>
  preview: (id: string) => Promise<void>
  cancel: () => void
  restore: () => Promise<void>
}

export interface AIPreview {
  title?: string
  subtitle?: string
  markdown: string
  model: string
  wordCount: number
}

export interface AIState {
  generating: boolean
  previewing: AIPreview | null
  generate: (prompt: string, length: string, modelId?: string) => Promise<void>
  stop: () => void
  accept: () => void
  discard: () => void
}

