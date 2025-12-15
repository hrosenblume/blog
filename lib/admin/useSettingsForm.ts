'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseSettingsFormOptions {
  /** Time in ms before "Saved!" message disappears */
  savedMessageDuration?: number
}

interface UseSettingsFormReturn<T> {
  /** Current settings data (null while loading) */
  data: T | null
  /** Update local data state */
  setData: React.Dispatch<React.SetStateAction<T | null>>
  /** Whether initial fetch is in progress */
  loading: boolean
  /** Whether save is in progress */
  saving: boolean
  /** Whether save just completed successfully */
  saved: boolean
  /** Save updates to the API (PATCH request) */
  save: (updates: Partial<T>) => Promise<void>
  /** Error message if save failed */
  error: string | null
}

/**
 * Hook for admin settings pages that need to:
 * 1. Fetch settings on mount
 * 2. Allow editing
 * 3. Save with loading/saved states
 * 
 * Reduces boilerplate in /admin/ai, /admin/seo, /admin/integrations pages.
 * 
 * @example
 * ```tsx
 * const { data, loading, saving, saved, save } = useSettingsForm<AISettings>('/api/ai/settings')
 * 
 * const handleSave = () => save({ rules, chatRules, defaultModel })
 * ```
 */
export function useSettingsForm<T>(
  endpoint: string,
  options: UseSettingsFormOptions = {}
): UseSettingsFormReturn<T> {
  const { savedMessageDuration = 2000 } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings on mount
  useEffect(() => {
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings')
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [endpoint])

  // Save handler
  const save = useCallback(async (updates: Partial<T>) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to save settings')
      }
      
      const newData = await res.json()
      setData(newData)
      setSaved(true)
      
      // Clear saved message after duration
      setTimeout(() => setSaved(false), savedMessageDuration)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      setError(message)
      console.error('Settings save error:', err)
    } finally {
      setSaving(false)
    }
  }, [endpoint, savedMessageDuration])

  return {
    data,
    setData,
    loading,
    saving,
    saved,
    save,
    error,
  }
}
