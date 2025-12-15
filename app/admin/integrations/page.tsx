'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { integrations, type Integration } from '@/lib/integrations/config'

// Helper to capitalize first letter for hasXxx keys
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Individual integration field component
function IntegrationField({
  integration,
  hasValue,
  source,
  displayValue,
  onSave,
  onClear,
  disabled,
}: {
  integration: Integration
  hasValue: boolean
  source: 'db' | 'env' | null
  displayValue: string
  onSave: (value: string) => void
  onClear: () => void
  disabled: boolean
}) {
  const [inputValue, setInputValue] = useState(displayValue)

  // Sync display value for non-password fields
  useEffect(() => {
    if (integration.inputType !== 'password') {
      setInputValue(displayValue)
    }
  }, [displayValue, integration.inputType])

  const handleSave = () => {
    onSave(inputValue)
    // Clear password inputs after save
    if (integration.inputType === 'password') {
      setInputValue('')
    }
  }

  const isFromEnv = source === 'env'

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{integration.label}</Label>
        {hasValue ? (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" /> 
            {isFromEnv ? 'Configured via env' : 'Configured'}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <X className="h-4 w-4" /> Not configured
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {integration.description}
        {isFromEnv && ' Set a value here to override the environment variable.'}
      </p>
      <div className="flex gap-2">
        <Input
          type={integration.inputType}
          placeholder={hasValue && integration.inputType === 'password' 
            ? `Enter new ${integration.label.toLowerCase()} to ${isFromEnv ? 'override' : 'replace'}...` 
            : integration.placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className={integration.inputType === 'password' ? 'font-mono text-sm' : 'text-sm'}
          disabled={disabled}
        />
        <Button
          onClick={handleSave}
          disabled={disabled || !inputValue.trim()}
          size="sm"
        >
          {hasValue && !isFromEnv ? 'Update' : isFromEnv ? 'Override' : 'Add'}
        </Button>
        {hasValue && !isFromEnv && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={disabled}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Dynamic state for all integrations
  const [settings, setSettings] = useState<Record<string, boolean | string>>({})

  // Fetch current settings on mount
  useEffect(() => {
    fetch('/api/integrations/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (key: string, value: string) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/integrations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      const data = await res.json()
      setSettings(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save setting')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async (key: string, label: string) => {
    if (!confirm(`Remove ${label}?`)) return

    setSaving(true)
    try {
      const res = await fetch('/api/integrations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: '' }),
      })
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error('Failed to clear:', err)
      alert('Failed to clear setting')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Integrations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
          <CardDescription>
            Configure tracking and contact settings. Values set here override environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {integrations.map((integration) => {
            const sourceKey = `${integration.key}Source`
            const source = settings[sourceKey] as 'db' | 'env' | '' | undefined
            return (
              <IntegrationField
                key={integration.key}
                integration={integration}
                hasValue={!!settings[`has${capitalize(integration.key)}`]}
                source={source === 'db' || source === 'env' ? source : null}
                displayValue={integration.inputType !== 'password' ? (settings[integration.key] as string || '') : ''}
                onSave={(value) => handleSave(integration.key, value)}
                onClear={() => handleClear(integration.key, integration.label)}
                disabled={saving}
              />
            )
          })}

          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Saved!
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
