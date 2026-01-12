'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { AutobloggerDashboard, type Session, type EditorState, type EditHandler } from 'autoblogger/ui'
import { cmsStyles } from '@/lib/cms-styles'
import { PolyhedraField } from '@/components/autoblogger/PolyhedraField'
import { SeoField } from '@/components/autoblogger/SeoField'
import { useDashboardContext, type EditorState as BlogEditorState } from '@/lib/dashboard'
import { useChatContext, type EssayEdit } from '@/lib/chat'
import { ChatIcon } from '@/components/Icons'

export default function WriterPage() {
  const router = useRouter()
  const { data: nextAuthSession } = useSession()
  const { theme, setTheme } = useTheme()
  const { registerEditor } = useDashboardContext()
  const { isOpen: chatOpen, setIsOpen: setChatOpen, setEssayContext, registerEditHandler } = useChatContext()
  
  // Handle Cmd+/ to toggle back to public site
  const handleToggleView = useCallback((currentPath: string, slug?: string) => {
    if (slug) {
      // From editor → go to public essay page
      router.push(`/e/${slug}`)
    } else {
      // From writer dashboard → go to homepage
      router.push('/')
    }
  }, [router])
  
  // Theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])
  
  // Sign out handler
  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' })
  }, [])
  
  // Track the autoblogger edit handler for bridging
  const autobloggerEditHandlerRef = useRef<EditHandler | null>(null)
  
  // Map NextAuth session to autoblogger's Session type
  const session: Session | null = nextAuthSession ? {
    user: {
      id: (nextAuthSession.user as { id?: string })?.id,
      name: nextAuthSession.user?.name ?? undefined,
      email: nextAuthSession.user?.email ?? undefined,
      role: (nextAuthSession.user as { role?: string })?.role,
    },
  } : null
  
  // Handle editor state changes - sync to both dashboard context and chat context
  const handleEditorStateChange = useCallback((state: EditorState | null) => {
    // Map autoblogger EditorState to blog's EditorState (they have the same shape)
    if (state) {
      const blogState: BlogEditorState = {
        hasUnsavedChanges: state.hasUnsavedChanges,
        status: state.status,
        savingAs: state.savingAs,
        onSave: state.onSave,
        confirmLeave: state.confirmLeave,
      }
      registerEditor(blogState)
      
      // Sync content to chat context
      if (state.content) {
        setEssayContext({
          title: state.content.title,
          subtitle: state.content.subtitle,
          markdown: state.content.markdown,
        })
      }
    } else {
      registerEditor(null)
      setEssayContext(null)
    }
  }, [registerEditor, setEssayContext])
  
  // Handle edit handler registration - bridge autoblogger's handler to chat context
  const handleRegisterEditHandler = useCallback((handler: EditHandler | null) => {
    autobloggerEditHandlerRef.current = handler
    
    if (handler) {
      // Register a bridge handler with the chat context
      const bridgeHandler = (edit: EssayEdit): boolean => {
        if (!autobloggerEditHandlerRef.current) return false
        // The types are compatible, so we can pass through directly
        return autobloggerEditHandlerRef.current(edit)
      }
      registerEditHandler(bridgeHandler)
    } else {
      registerEditHandler(null)
    }
  }, [registerEditHandler])
  
  // Chat toggle button for navbar
  const chatToggleButton = (
    <button
      type="button"
      onClick={() => setChatOpen(!chatOpen)}
      className={`w-9 h-9 rounded-md border border-border hover:bg-accent text-muted-foreground flex items-center justify-center touch-manipulation ${chatOpen ? 'bg-accent' : ''}`}
      aria-label="Chat with AI"
      title="Chat with AI"
    >
      <ChatIcon />
    </button>
  )

  return (
    <AutobloggerDashboard 
      basePath="/writer"
      apiBasePath="/api/cms"
      styles={cmsStyles}
      session={session}
      onEditorStateChange={handleEditorStateChange}
      onRegisterEditHandler={handleRegisterEditHandler}
      onToggleView={handleToggleView}
      // Navbar props
      onSignOut={handleSignOut}
      onThemeToggle={handleThemeToggle}
      theme={theme === 'dark' ? 'dark' : 'light'}
      navbarRightSlot={chatToggleButton}
      fields={[
        {
          name: 'polyhedraShape',
          label: 'Shape',
          component: PolyhedraField as any,
          position: 'footer',
        },
        {
          name: 'seo',  // Compound field - uses onFieldChange for multiple properties
          component: SeoField as any,
          position: 'footer',
        },
      ]}
    />
  )
}
