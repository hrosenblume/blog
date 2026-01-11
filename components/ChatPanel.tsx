'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, X, Copy, Check, ArrowUp, Pencil, Undo2, ChevronDown, MessageSquare, Globe, Brain, Square, List } from 'lucide-react'
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
import { markdownToHtml } from '@/lib/markdown'
import { PROSE_CLASSES } from '@/lib/article-layout'
import { useChatContext, ChatMode } from '@/lib/chat'
import { useAIModels } from '@/lib/ai/useAIModels'
import { ModelSelector } from '@/components/editor/ModelSelector'

/** Strip <plan> tags for display during streaming */
function stripPlanTags(content: string): string {
  return content
    .replace(/<plan>/gi, '')
    .replace(/<\/plan>/gi, '')
}

export function ChatPanel() {
  const { 
    messages, 
    isStreaming, 
    isOpen: open, 
    setIsOpen,
    sendMessage: contextSendMessage,
    stopStreaming,
    essayContext,
    mode,
    setMode,
    undoEdit,
    webSearchEnabled,
    setWebSearchEnabled,
    thinkingEnabled,
    setThinkingEnabled,
    selectedModel,
    setSelectedModel,
    expandPlan,
  } = useChatContext()
  
  const router = useRouter()
  const pathname = usePathname()
  const isOnEditor = pathname?.startsWith('/writer/editor')
  
  const [input, setInput] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevMessageCountRef = useRef(0)
  const savedScrollPositionRef = useRef<number | null>(null)
  
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
  
  // Handle Draft Essay button - either expand in current editor or navigate to new editor
  const handleDraftEssay = useCallback(() => {
    // Find the last assistant message (the plan)
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastAssistantMessage?.content) return
    
    if (isOnEditor) {
      // Already on editor page - use the registered handler and switch to agent mode
      expandPlan()
      setMode('agent')
    } else {
      // Not on editor - store plan in sessionStorage and navigate
      // Mode will be set to agent after navigation in the editor
      sessionStorage.setItem('pendingPlan', lastAssistantMessage.content)
      setIsOpen(false)
      router.push('/writer/editor?fromPlan=1')
    }
  }, [messages, isOnEditor, expandPlan, setIsOpen, setMode, router])
  
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

  // Save scroll position when panel closes
  useEffect(() => {
    if (!open && messagesContainerRef.current) {
      savedScrollPositionRef.current = messagesContainerRef.current.scrollTop
    }
  }, [open])

  // Restore scroll position or scroll to bottom for new messages
  useEffect(() => {
    if (!open || !isVisible) return
    
    const container = messagesContainerRef.current
    if (!container) return
    
    const prevCount = prevMessageCountRef.current
    const currentCount = messages.length
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (currentCount > prevCount) {
          // New messages added - scroll to bottom
          // Use instant for initial history load, smooth for chat messages
          const behavior = prevCount === 0 ? 'instant' : 'smooth'
          messagesEndRef.current?.scrollIntoView({ behavior })
        } else if (savedScrollPositionRef.current !== null) {
          // Re-opening panel - restore scroll position
          container.scrollTop = savedScrollPositionRef.current
        }
        
        prevMessageCountRef.current = currentCount
      })
    })
  }, [messages.length, open, isVisible])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])


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
  
  // Keyboard shortcut for agent mode (Cmd/Ctrl + Shift + A)
  // Opens chat in agent mode if on an essay, or just opens chat otherwise
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        if (!open) {
          setIsOpen(true)
        }
        // Only switch to agent mode if there's an essay context
        if (essayContext) {
          setMode('agent')
        }
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, setIsOpen, setMode, essayContext])

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
            className="w-8 h-8 rounded-md interactive-bg-accent flex items-center justify-center text-muted-foreground"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xs px-6">
                <p className="text-muted-foreground text-sm">
                  {mode === 'plan'
                    ? "Describe your essay idea and I'll create a structured outline with section headers and key points."
                    : essayContext 
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
                    {message.role === 'assistant' ? (
                      <div 
                        className={cn(PROSE_CLASSES, '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0')}
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(stripPlanTags(message.content)) }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    )}
                    {isStreaming && index === messages.length - 1 && message.role === 'assistant' && (
                      <span className="inline-block w-1.5 h-3 bg-current ml-0.5 animate-pulse" />
                    )}
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
                    {/* Action buttons for assistant messages */}
                    {message.role === 'assistant' && !isStreaming && (
                      <div className="absolute -bottom-6 left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.content, index)}
                          className="text-muted-foreground hover:text-foreground p-1 rounded"
                          aria-label="Copy message"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Draft Essay button for plan mode - appears on last assistant message generated in plan mode */}
                        {message.mode === 'plan' && index === messages.length - 1 && message.content && (
                          <button
                            onClick={handleDraftEssay}
                            className="text-xs text-muted-foreground hover:text-foreground px-1 rounded"
                          >
                            Draft Essay
                          </button>
                        )}
                      </div>
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
                    mode === 'ask' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    mode === 'agent' && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    mode === 'plan' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    "hover:opacity-80"
                  )}
                  title="Switch mode (⌘⇧A)"
                >
                  {mode === 'ask' && <MessageSquare className="w-3 h-3" />}
                  {mode === 'agent' && <Pencil className="w-3 h-3" />}
                  {mode === 'plan' && <List className="w-3 h-3" />}
                  {mode === 'ask' ? 'Ask' : mode === 'agent' ? 'Agent' : 'Plan'}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px] z-[80]">
                <DropdownMenuItem 
                  onClick={() => { setMode('agent'); textareaRef.current?.focus() }}
                  disabled={!essayContext}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" />
                    Agent
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">⌘⇧A</span>
                    {mode === 'agent' && <Check className="w-4 h-4" />}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setMode('plan'); textareaRef.current?.focus() }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Plan
                  </span>
                  {mode === 'plan' && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setMode('ask'); textareaRef.current?.focus() }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ask
                  </span>
                  {mode === 'ask' && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Web Search Toggle */}
            <ControlButton
              onClick={() => { setWebSearchEnabled(!webSearchEnabled); textareaRef.current?.focus() }}
              active={webSearchEnabled}
              title={webSearchEnabled ? "Web search enabled" : "Enable web search"}
              tabIndex={-1}
            >
              <Globe className="w-4 h-4" />
            </ControlButton>
            
            {/* Thinking Mode Toggle */}
            <ControlButton
              onClick={() => { setThinkingEnabled(!thinkingEnabled); textareaRef.current?.focus() }}
              active={thinkingEnabled}
              title={thinkingEnabled ? "Thinking mode enabled" : "Enable thinking mode"}
              tabIndex={-1}
            >
              <Brain className="w-4 h-4" />
            </ControlButton>
            
            {/* Model Dropdown */}
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={(id) => { setSelectedModel(id); textareaRef.current?.focus() }}
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
                mode === 'plan'
                  ? "Describe your essay idea..."
                  : mode === 'agent' && essayContext
                    ? "Ask me to edit your essay..."
                    : essayContext 
                      ? "Ask about your essay..." 
                      : "Ask anything..."
              }
              className="min-h-[40px] max-h-[120px] resize-none"
              rows={1}
              enterKeyHint="send"
              autoFocus
            />
            <Button
              type={isStreaming ? 'button' : 'submit'}
              onClick={isStreaming ? stopStreaming : undefined}
              disabled={!isStreaming && !input.trim()}
              size="icon"
              variant="secondary"
              className="rounded-full w-10 h-10 flex-shrink-0 border border-input touch-manipulation"
            >
              {isStreaming ? (
                <Square className="h-4 w-4 fill-current" />
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
