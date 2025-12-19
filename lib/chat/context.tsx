'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import { getSearchModel } from '@/lib/ai/models'

export interface EssaySnapshot {
  title: string
  subtitle: string
  markdown: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
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

export type ChatMode = 'ask' | 'agent' | 'search'

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

interface ChatContextValue {
  // State
  messages: Message[]
  essayContext: EssayContext | null
  isStreaming: boolean
  isOpen: boolean
  mode: ChatMode
  webSearchEnabled: boolean
  selectedModel: string
  
  // Actions
  setEssayContext: (context: EssayContext | null) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  setIsOpen: (open: boolean) => void
  setMode: (mode: ChatMode) => void
  setWebSearchEnabled: (enabled: boolean) => void
  setSelectedModel: (modelId: string) => void
  registerEditHandler: (handler: EditHandler | null) => void
  undoEdit: (messageIndex: number) => void
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

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [essayContext, setEssayContext] = useState<EssayContext | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode>('ask')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-sonnet')
  
  // Edit handler registered by the editor
  const editHandlerRef = useRef<EditHandler | null>(null)
  
  const registerEditHandler = useCallback((handler: EditHandler | null) => {
    editHandlerRef.current = handler
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsStreaming(true)

    // Add empty assistant message that we'll stream into
    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    try {
      // Determine which model to use based on web search toggle
      const searchModelVariant = getSearchModel(selectedModel)
      const useNativeSearch = webSearchEnabled && searchModelVariant !== null
      const useSearchFirstFlow = webSearchEnabled && searchModelVariant === null
      
      let searchContext: string | null = null
      
      if (useSearchFirstFlow) {
        // For Claude: 2-call flow - first call GPT-4o-search to get facts
        const searchResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: content.trim() }],
            modelId: 'gpt-4o',
            useSearchModel: true, // Tell API to use search variant
            mode: 'search',
          }),
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          searchContext = searchData.content
        }
      }
      
      // Build the messages for the main call
      const messagesForApi = searchContext
        ? [
            { role: 'user' as const, content: `[Web Search Results]\n${searchContext}\n\n[User Question]\n${content.trim()}` },
            ...newMessages.slice(0, -1), // Previous messages without the current one
          ]
        : newMessages
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: searchContext ? messagesForApi : newMessages,
          essayContext: essayContext,
          mode: mode,
          modelId: selectedModel,
          useSearchModel: useNativeSearch, // Use search variant for GPT models
        }),
      })

      if (!response.ok) {
        // Safely handle non-JSON error responses (e.g., HTML error pages)
        const errorText = await response.text()
        try {
          const error = JSON.parse(errorText)
          throw new Error(error.error || 'Failed to send message')
        } catch {
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`)
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
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
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
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { 
              role: 'assistant', 
              content: cleanContent || 'Edit applied.',
              appliedEdits,
              previousState: appliedEdits ? previousState : undefined,
            }
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `Error: ${errorMessage}` }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming, essayContext, mode, webSearchEnabled, selectedModel])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

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

  return (
    <ChatContext.Provider
      value={{
        messages,
        essayContext,
        isStreaming,
        isOpen,
        mode,
        webSearchEnabled,
        selectedModel,
        setEssayContext,
        sendMessage,
        clearMessages,
        setIsOpen,
        setMode,
        setWebSearchEnabled,
        setSelectedModel,
        registerEditHandler,
        undoEdit,
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

