'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'

export interface EditorState {
  hasUnsavedChanges: boolean
  status: 'draft' | 'published'
  savingAs: 'draft' | 'published' | null
  onSave: (status: 'draft' | 'published') => void
  confirmLeave: () => boolean
}

interface DashboardContextValue {
  // Editor registers its state here
  editorState: EditorState | null
  registerEditor: (state: EditorState | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState | null>(null)

  const registerEditor = useCallback((state: EditorState | null) => {
    setEditorState(state)
  }, [])

  const contextValue = useMemo(() => ({
    editorState,
    registerEditor,
  }), [editorState, registerEditor])

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return context
}

