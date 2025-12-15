'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface EssayContext {
  title: string
  subtitle?: string
  markdown: string
}

interface ChatContextValue {
  // State
  messages: Message[]
  essayContext: EssayContext | null
  isStreaming: boolean
  isOpen: boolean
  
  // Actions
  setEssayContext: (context: EssayContext | null) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  setIsOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [essayContext, setEssayContext] = useState<EssayContext | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          essayContext: essayContext,
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
  }, [messages, isStreaming, essayContext])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <ChatContext.Provider
      value={{
        messages,
        essayContext,
        isStreaming,
        isOpen,
        setEssayContext,
        sendMessage,
        clearMessages,
        setIsOpen,
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

