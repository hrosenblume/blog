'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  open: boolean
  onClose: () => void
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Client-side only for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle open/close animation and body scroll lock
  useEffect(() => {
    if (open) {
      setIsVisible(true)
      // Lock body scroll on iOS
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      // Restore body scroll
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    // Add empty assistant message that we'll stream into
    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
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
  }, [input, messages, isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }

  if (!isVisible || !mounted) return null

  return createPortal(
    <>
      {/* Backdrop - use 100dvh to cover full dynamic viewport on iOS */}
      <div 
        className={cn(
          "fixed inset-x-0 top-0 h-[100dvh] bg-black/20 z-40 transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Panel - full screen on mobile, full-height side panel on desktop */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Chat"
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-xl transition-transform duration-200 ease-out overflow-hidden",
          // Mobile: full screen with dynamic viewport height
          "inset-x-0 top-0 h-[100dvh]",
          // Desktop: full-height right panel
          "md:left-auto md:w-full md:max-w-md md:border-l md:border-border",
          // Animation
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="font-medium">Chat</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xs px-6">
                <p className="text-muted-foreground text-sm">
                  Chat with AI to brainstorm ideas, get feedback, or explore topics.
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                      {isStreaming && index === messages.length - 1 && message.role === 'assistant' && (
                        <span className="inline-block w-1.5 h-3 bg-current ml-0.5 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input - wrapped in form to isolate from other form fields and remove iOS nav arrows */}
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex-shrink-0 border-t border-border bg-background p-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        >
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="min-h-[40px] max-h-[120px] resize-none"
              disabled={isStreaming}
              rows={1}
              enterKeyHint="send"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isStreaming}
              size="sm"
              className="h-auto px-4"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>,
    document.body
  )
}
