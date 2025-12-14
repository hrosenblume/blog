'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function SEOSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('')
  const [siteTitleTemplate, setSiteTitleTemplate] = useState('%s | {name}')
  const [siteDescription, setSiteDescription] = useState('')
  const [siteKeywords, setSiteKeywords] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgLogo, setOrgLogo] = useState('')
  const [orgSameAs, setOrgSameAs] = useState('[]')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch current settings on mount
  useEffect(() => {
    fetch('/api/seo/settings')
      .then(res => res.json())
      .then(data => {
        setSiteTitle(data.siteTitle || '')
        setSiteTitleTemplate(data.siteTitleTemplate || '%s | {name}')
        setSiteDescription(data.siteDescription || '')
        setSiteKeywords(data.siteKeywords || '')
        setTwitterHandle(data.twitterHandle || '')
        setOrgName(data.orgName || '')
        setOrgLogo(data.orgLogo || '')
        setOrgSameAs(data.orgSameAs || '[]')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/seo/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle,
          siteTitleTemplate,
          siteDescription,
          siteKeywords,
          twitterHandle,
          orgName,
          orgLogo,
          orgSameAs,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings')
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
      <h1 className="text-2xl font-bold">SEO Settings</h1>

      {/* Site Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Site Metadata</CardTitle>
          <CardDescription>
            Configure default SEO settings for your site. These values are used when posts don't have custom SEO overrides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={e => setSiteTitle(e.target.value)}
              placeholder="Hunter Rosenblume"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              The main title of your site, shown in browser tabs and search results.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteTitleTemplate">Title Template</Label>
            <Input
              id="siteTitleTemplate"
              value={siteTitleTemplate}
              onChange={e => setSiteTitleTemplate(e.target.value)}
              placeholder="%s | {name}"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Template for page titles. Use <code className="text-xs bg-muted px-1 py-0.5 rounded">%s</code> for the page title and <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{name}'}</code> for your name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={siteDescription}
              onChange={e => setSiteDescription(e.target.value)}
              placeholder="Essays on startups, building, and life."
              className="min-h-[80px] resize-none"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Default meta description for your site (max 160 characters recommended).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteKeywords">Default Keywords</Label>
            <Input
              id="siteKeywords"
              value={siteKeywords}
              onChange={e => setSiteKeywords(e.target.value)}
              placeholder="essays, startups, building, writing"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated keywords for your site.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterHandle">Twitter Handle</Label>
            <Input
              id="twitterHandle"
              value={twitterHandle}
              onChange={e => setTwitterHandle(e.target.value)}
              placeholder="@hrosenblume"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Your Twitter/X handle for social cards.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Organization (JSON-LD) */}
      <Card>
        <CardHeader>
          <CardTitle>Organization (Structured Data)</CardTitle>
          <CardDescription>
            Information for JSON-LD structured data. Helps search engines understand your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Hunter Rosenblume"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              Your name or organization name for structured data.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgLogo">Logo URL</Label>
            <Input
              id="orgLogo"
              value={orgLogo}
              onChange={e => setOrgLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              URL to your logo image (112x112px minimum recommended).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgSameAs">Social Profile URLs</Label>
            <Textarea
              id="orgSameAs"
              value={orgSameAs}
              onChange={e => setOrgSameAs(e.target.value)}
              placeholder='["https://twitter.com/username", "https://linkedin.com/in/username"]'
              className="min-h-[100px] font-mono text-sm resize-none"
              disabled={saving}
            />
            <p className="text-sm text-muted-foreground">
              JSON array of your social profile URLs. Used in OrganizationJsonLd for knowledge graph.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Saved!
          </span>
        )}
      </div>
    </div>
  )
}
