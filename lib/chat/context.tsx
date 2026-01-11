'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { modelHasNativeSearch } from '@/lib/ai/models'
import { extractUrls, fetchUrlContent } from '@/lib/chat/extract'

export interface EssaySnapshot {
  title: string
  subtitle: string
  markdown: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  // Track which mode this message was generated in
  mode?: ChatMode
  // Track if this message applied edits (for UI indicator)
  appliedEdits?: boolean
  // Store state before edits were applied (for undo)
  previousState?: EssaySnapshot
}

export interface EssayContext {
  title: string
  subtitle?: string
  markdown: string
}

export type ChatMode = 'ask' | 'agent' | 'search' | 'plan'

export interface EssayEdit {
  type: 'replace_all' | 'replace_section' | 'insert' | 'delete'
  // For replace_all: full new content
  title?: string
  subtitle?: string
  markdown?: string
  // For targeted edits: what to find and replace
  find?: string
  replace?: string
  position?: 'before' | 'after' | 'start' | 'end'  // for insert
}

export type EditHandler = (edit: EssayEdit) => boolean  // returns true if edit was applied
export type ExpandPlanHandler = (plan: string, wordCount: number) => void  // triggers essay generation from plan

interface ChatContextValue {
  // State
  messages: Message[]
  essayContext: EssayContext | null
  isStreaming: boolean
  isOpen: boolean
  mode: ChatMode
  webSearchEnabled: boolean
  thinkingEnabled: boolean
  selectedModel: string
  
  // Actions
  setEssayContext: (context: EssayContext | null) => void
  sendMessage: (content: string) => Promise<void>
  stopStreaming: () => void
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearMessages: () => void
  setIsOpen: (open: boolean) => void
  setMode: (mode: ChatMode) => void
  setWebSearchEnabled: (enabled: boolean) => void
  setThinkingEnabled: (enabled: boolean) => void
  setSelectedModel: (modelId: string) => void
  registerEditHandler: (handler: EditHandler | null) => void
  undoEdit: (messageIndex: number) => void
  registerExpandPlanHandler: (handler: ExpandPlanHandler | null) => void
  expandPlan: (wordCount?: number) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

// Parse edit blocks from agent mode responses
function parseEditBlocks(content: string): { edits: EssayEdit[], cleanContent: string } {
  const editRegex = /:::edit\s*([\s\S]*?)\s*:::/g
  const edits: EssayEdit[] = []
  let cleanContent = content
  
  let match
  while ((match = editRegex.exec(content)) !== null) {
    try {
      const edit = JSON.parse(match[1]) as EssayEdit
      edits.push(edit)
      // Remove the edit block from display content
      cleanContent = cleanContent.replace(match[0], '')
    } catch {
      // Invalid JSON, skip this edit block
      console.warn('Failed to parse edit block:', match[1])
    }
  }
  
  // Clean up extra whitespace from removed blocks
  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n').trim()
  
  return { edits, cleanContent }
}

/**
 * Clean plan mode output by stripping any text after the last bullet point.
 * The plan format is:
 *   # Title
 *   *Subtitle*
 *   ## Section
 *   - bullet
 *   ## Section
 *   - bullet
 * 
 * Any text after the last "- " line is conversational filler and should be removed.
 */
function cleanPlanOutput(content: string): string {
  let cleaned = content
  
  // Step 1: Extract content from <plan> tags if present
  const planMatch = cleaned.match(/<plan>([\s\S]*?)<\/plan>/i)
  if (planMatch) {
    cleaned = planMatch[1]
  } else {
    // If no closing tag, try to get content after opening tag
    const openTagMatch = cleaned.match(/<plan>([\s\S]*)/i)
    if (openTagMatch) {
      cleaned = openTagMatch[1]
    }
  }
  
  // Step 2: Strip any text after the last bullet point
  const lines = cleaned.split('\n')
  let lastBulletIndex = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('- ')) {
      lastBulletIndex = i
      break
    }
  }
  
  // If no bullet found, return as-is (not a valid plan format)
  if (lastBulletIndex === -1) {
    return cleaned.trim()
  }
  
  // Keep everything up to and including the last bullet
  return lines.slice(0, lastBulletIndex + 1).join('\n').trim()
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [essayContext, setEssayContext] = useState<EssayContext | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode>('ask')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [thinkingEnabled, setThinkingEnabled] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-sonnet')
  
  // Edit handler registered by the editor
  const editHandlerRef = useRef<EditHandler | null>(null)
  // Expand plan handler registered by the editor
  const expandPlanHandlerRef = useRef<ExpandPlanHandler | null>(null)
  // Track if history has been loaded
  const historyLoadedRef = useRef(false)
  // AbortController for cancelling streaming requests
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const registerEditHandler = useCallback((handler: EditHandler | null) => {
    editHandlerRef.current = handler
  }, [])

  const registerExpandPlanHandler = useCallback((handler: ExpandPlanHandler | null) => {
    expandPlanHandlerRef.current = handler
  }, [])

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Load history on first open
  useEffect(() => {
    if (isOpen && !historyLoadedRef.current) {
      historyLoadedRef.current = true
      fetch('/api/chat/history')
        .then(res => res.ok ? res.json() : [])
        .then((data: { role: 'user' | 'assistant'; content: string }[]) => {
          if (data.length > 0) {
            setMessages(data.map(m => ({ role: m.role, content: m.content })))
          }
        })
        .catch(() => {
          // Silently fail - history is not critical
        })
    }
  }, [isOpen])

  // Helper to save a message to the database
  const saveMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    fetch('/api/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content }),
    }).catch(() => {
      // Silently fail - saving is not critical
    })
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    const userMessage: Message = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsStreaming(true)

    // Save user message to history
    saveMessage('user', content.trim())

    // Add empty assistant message that we'll stream into
    const assistantMessage: Message = { role: 'assistant', content: '', mode }
    setMessages([...newMessages, assistantMessage])

    try {
      // Extract and fetch content from any URLs in the message
      const urls = extractUrls(content)
      let enrichedContent = content.trim()
      
      if (urls.length > 0) {
        const extracted = await fetchUrlContent(urls)
        for (const item of extracted) {
          if (item.content) {
            const title = item.title ? `${item.title}\n` : ''
            enrichedContent += `\n\n[Content from ${item.url}]:\n${title}${item.content}`
          }
        }
      }
      
      // Determine web search approach based on model
      const hasNativeSearch = modelHasNativeSearch(selectedModel)
      const useSearchFirstFlow = webSearchEnabled && !hasNativeSearch
      
      let searchContext: string | null = null
      
      if (useSearchFirstFlow) {
        // For Claude: 2-call flow - first call GPT-5.2 with web search to get facts
        const searchResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: enrichedContent }],
            modelId: 'gpt-5.2',
            useWebSearch: true,
            mode: 'search',
          }),
          signal,
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          searchContext = searchData.content
        }
      }
      
      // Build the messages for the main call
      // Use enrichedContent (which may include extracted URL content) in the last message
      const messagesForApi = searchContext
        ? [
            ...newMessages.slice(0, -1), // Previous messages without the current one
            { role: 'user' as const, content: `[Web Search Results]\n${searchContext}\n\n[User Question]\n${enrichedContent}` },
          ]
        : [
            ...newMessages.slice(0, -1),
            { role: 'user' as const, content: enrichedContent },
          ]
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messagesForApi,
          essayContext: essayContext,
          mode: mode,
          modelId: selectedModel,
          useWebSearch: webSearchEnabled && hasNativeSearch, // Native search for GPT models
          useThinking: thinkingEnabled,
        }),
        signal,
      })

      if (!response.ok) {
        // Friendly messages for common HTTP errors
        if (response.status === 503) {
          throw new Error('AI service temporarily unavailable. Please try again in a moment.')
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.')
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication error. Check your API keys in Settings.')
        }
        
        // Safely handle non-JSON error responses (e.g., HTML error pages)
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          throw new Error(error.error || 'Failed to send message')
        } catch {
          throw new Error(`Server error (${response.status}). Please try again.`)
        }
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let appliedEdits = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk

        // Update the assistant message with streamed content
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent, mode }
          return updated
        })
      }
      
      // After streaming completes, parse and apply edits if in agent mode
      if (mode === 'agent' && editHandlerRef.current && essayContext) {
        const { edits, cleanContent } = parseEditBlocks(assistantContent)
        
        // Capture state before applying edits (for undo)
        const previousState: EssaySnapshot = {
          title: essayContext.title,
          subtitle: essayContext.subtitle || '',
          markdown: essayContext.markdown,
        }
        
        for (const edit of edits) {
          const success = editHandlerRef.current(edit)
          if (success) appliedEdits = true
        }
        
        // Update the final message with clean content, applied flag, and previous state
        if (edits.length > 0) {
          const finalContent = cleanContent || 'Edit applied.'
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { 
              role: 'assistant', 
              content: finalContent,
              mode,
              appliedEdits,
              previousState: appliedEdits ? previousState : undefined,
            }
            return updated
          })
          // Save the cleaned content to history
          saveMessage('assistant', finalContent)
        } else {
          // No edits, save the raw content
          saveMessage('assistant', assistantContent)
        }
      } else if (mode === 'plan') {
        // Plan mode: clean trailing conversational text
        const cleanedContent = cleanPlanOutput(assistantContent)
        
        // Update the message with cleaned content
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { 
            role: 'assistant', 
            content: cleanedContent,
            mode,
          }
          return updated
        })
        
        // Save the cleaned content to history
        saveMessage('assistant', cleanedContent)
      } else {
        // Other modes: save the response as-is
        saveMessage('assistant', assistantContent)
      }
    } catch (error) {
      // Don't show error for aborted requests - keep partial response
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, keep whatever was streamed
        return
      }
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `Error: ${errorMessage}` }
        return updated
      })
    } finally {
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [messages, isStreaming, essayContext, mode, webSearchEnabled, thinkingEnabled, selectedModel, saveMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Add a message directly (for logging generation, etc.)
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: Message = { role, content }
    setMessages(prev => [...prev, message])
    // Save to history
    saveMessage(role, content)
  }, [saveMessage])

  // Undo an edit by restoring the previous state
  const undoEdit = useCallback((messageIndex: number) => {
    const message = messages[messageIndex]
    if (!message?.previousState || !editHandlerRef.current) return
    
    // Restore the previous state via the edit handler
    const success = editHandlerRef.current({
      type: 'replace_all',
      title: message.previousState.title,
      subtitle: message.previousState.subtitle,
      markdown: message.previousState.markdown,
    })
    
    if (success) {
      // Clear the appliedEdits and previousState from this message
      setMessages(prev => {
        const updated = [...prev]
        updated[messageIndex] = {
          ...updated[messageIndex],
          appliedEdits: false,
          previousState: undefined,
        }
        return updated
      })
    }
  }, [messages])

  // Expand the current plan into a full essay
  const expandPlan = useCallback((wordCount: number = 800) => {
    if (!expandPlanHandlerRef.current) return
    
    // Find the last assistant message (the current plan)
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistantMessage?.content) return
    
    // Call the handler with the plan content
    expandPlanHandlerRef.current(lastAssistantMessage.content, wordCount)
    
    // Close the chat panel
    setIsOpen(false)
  }, [messages])

  return (
    <ChatContext.Provider
      value={{
        messages,
        essayContext,
        isStreaming,
        isOpen,
        mode,
        webSearchEnabled,
        thinkingEnabled,
        selectedModel,
        setEssayContext,
        sendMessage,
        stopStreaming,
        addMessage,
        clearMessages,
        setIsOpen,
        setMode,
        setWebSearchEnabled,
        setThinkingEnabled,
        setSelectedModel,
        registerEditHandler,
        undoEdit,
        registerExpandPlanHandler,
        expandPlan,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

