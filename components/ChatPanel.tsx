'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X, Copy, Check, ArrowUp, Pencil, Undo2, ChevronDown, MessageSquare, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ControlButton } from '@/components/ui/control-button'
import { cn } from '@/lib/utils/cn'
import { useChatContext, ChatMode } from '@/lib/chat'
import { useAIModels } from '@/lib/ai/useAIModels'
import { ModelSelector } from '@/components/editor/ModelSelector'

export function ChatPanel() {
  const { 
    messages, 
    isStreaming, 
    isOpen: open, 
    setIsOpen,
    sendMessage: contextSendMessage,
    essayContext,
    mode,
    setMode,
    undoEdit,
    webSearchEnabled,
    setWebSearchEnabled,
    selectedModel,
    setSelectedModel,
  } = useChatContext()
  
  const [input, setInput] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Fetch models, use context for selection state
  const { models, currentModel } = useAIModels({
    externalSelectedModel: selectedModel,
    externalSetSelectedModel: setSelectedModel,
  })
  
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen])
  
  const toggleMode = useCallback(() => {
    setMode(mode === 'ask' ? 'agent' : 'ask')
  }, [mode, setMode])
  
  const copyToClipboard = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])
  
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
    const content = input.trim()
    setInput('')
    await contextSendMessage(content)
  }, [input, isStreaming, contextSendMessage])

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
  
  // Keyboard shortcut for toggling mode (Cmd/Ctrl + Shift + A)
  useEffect(() => {
    if (!open) return
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        toggleMode()
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, toggleMode])

  if (!isVisible || !mounted) return null

  return createPortal(
    <>
      {/* Backdrop - use 100dvh to cover full dynamic viewport on iOS */}
      <div 
        className={cn(
          "fixed inset-0 h-[100dvh] bg-black/20 z-[60] transition-opacity duration-200",
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
          "fixed z-[70] flex flex-col bg-background shadow-xl transition-transform duration-200 ease-out overflow-hidden",
          // Mobile: full screen with dynamic viewport height
          "inset-x-0 top-0 h-[100dvh]",
          // Desktop: full-height right panel (380px to leave room for essay)
          "md:left-auto md:w-full md:max-w-[380px] md:border-l md:border-border",
          // Animation
          isAnimating ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">Chat</h2>
            {essayContext && (
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {essayContext.title || 'Untitled'}
              </span>
            )}
          </div>
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
                  {essayContext 
                    ? "Chat about your essay — ask for feedback, discuss ideas, or get help with specific sections."
                    : "Chat with AI to brainstorm ideas, get feedback, or explore topics."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3 group',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm relative',
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
                    {/* Applied edit indicator with undo button */}
                    {message.appliedEdits && message.previousState && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Pencil className="w-3 h-3" />
                          <span>Edit applied</span>
                        </div>
                        <button
                          onClick={() => undoEdit(index)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Undo edit"
                        >
                          <Undo2 className="w-3 h-3" />
                          <span>Undo</span>
                        </button>
                      </div>
                    )}
                    {/* Copy button for assistant messages */}
                    {message.role === 'assistant' && !isStreaming && (
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded"
                        aria-label="Copy message"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
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
          {/* Controls Row: Mode Dropdown, Globe Toggle, Model Dropdown */}
          <div className="mb-2 flex items-center gap-3">
            {/* Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors",
                    mode === 'ask'
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    "hover:opacity-80"
                  )}
                  title="Switch mode (⌘⇧A)"
                >
                  {mode === 'ask' ? (
                    <MessageSquare className="w-3 h-3" />
                  ) : (
                    <Pencil className="w-3 h-3" />
                  )}
                  {mode === 'ask' ? 'Ask' : 'Agent'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px] z-[80]">
                <DropdownMenuItem 
                  onClick={() => setMode('ask')}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ask
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">⌘⇧A</span>
                    {mode === 'ask' && <Check className="w-4 h-4" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setMode('agent')}
                  disabled={!essayContext}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Agent
                  </span>
                  {mode === 'agent' && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Web Search Toggle */}
            <ControlButton
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              active={webSearchEnabled}
              title={webSearchEnabled ? "Web search enabled" : "Enable web search"}
            >
              <Globe className="w-4 h-4" />
            </ControlButton>
            
            {/* Model Dropdown */}
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              currentModel={currentModel}
              zIndex={80}
            />
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'agent' && essayContext
                  ? "Ask me to edit your essay..."
                  : essayContext 
                    ? "Ask about your essay..." 
                    : "Ask anything..."
              }
              className="min-h-[40px] max-h-[120px] resize-none"
              disabled={isStreaming}
              rows={1}
              enterKeyHint="send"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isStreaming}
              size="icon"
              variant="secondary"
              className="rounded-full w-10 h-10 flex-shrink-0 border border-input"
            >
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </>,
    document.body
  )
}
