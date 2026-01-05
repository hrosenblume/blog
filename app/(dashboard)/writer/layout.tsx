'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useKeyboard, SHORTCUTS } from '@/lib/keyboard'
import { useChatContext } from '@/lib/chat'

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen: chatOpen, setIsOpen: setChatOpen } = useChatContext()
  const isEditor = pathname?.startsWith('/writer/editor')

  // Prevent body scroll for app-like feel (non-editor pages only)
  useEffect(() => {
    if (!isEditor) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
      }
    }
  }, [isEditor])

  // Keyboard shortcuts for writer layout
  useKeyboard([
    { 
      ...SHORTCUTS.TOGGLE_VIEW, 
      handler: () => { 
        // Cmd+/ to toggle to homepage (only on /writer dashboard, not in editor)
        if (pathname === '/writer') {
          router.push('/') 
        }
      } 
    },
    {
      ...SHORTCUTS.CHAT_TOGGLE,
      handler: () => setChatOpen(!chatOpen),
    },
  ])

  return (
    <div className={isEditor ? '' : ''}>
      <div className={isEditor ? '' : 'overflow-auto'} inert={chatOpen && !isEditor ? true : undefined}>
        {children}
      </div>
    </div>
  )
}

