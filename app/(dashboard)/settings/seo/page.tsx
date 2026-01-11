'use client'

import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { OgImageUpload } from '@/components/admin/OgImageUpload'
import { SocialPreviews } from '@/components/admin/SocialPreviews'

type PageSeoData = {
  id: string
  path: string
  name: string
  description: string
  title: string | null
  keywords: string | null
  noIndex: boolean
  ogImage: string | null
}

export default function SEOSettingsPage() {
  // Site-wide settings
  const [siteTitle, setSiteTitle] = useState('')
  const [siteTitleTemplate, setSiteTitleTemplate] = useState('%s | {name}')
  const [siteDescription, setSiteDescription] = useState('')
  const [siteKeywords, setSiteKeywords] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgLogo, setOrgLogo] = useState('')
  const [orgSameAs, setOrgSameAs] = useState('[]')
  const [defaultOgImage, setDefaultOgImage] = useState('')
  
  // Per-page settings
  const [pages, setPages] = useState<PageSeoData[]>([])
  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [pageSaving, setPageSaving] = useState<string | null>(null)
  const [pageSaved, setPageSaved] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch current settings on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/seo/settings').then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      }),
      fetch('/api/seo/pages').then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      }),
    ])
      .then(([siteData, pagesData]) => {
        setSiteTitle(siteData.siteTitle || '')
        setSiteTitleTemplate(siteData.siteTitleTemplate || '%s | {name}')
        setSiteDescription(siteData.siteDescription || '')
        setSiteKeywords(siteData.siteKeywords || '')
        setTwitterHandle(siteData.twitterHandle || '')
        setOrgName(siteData.orgName || '')
        setOrgLogo(siteData.orgLogo || '')
        setOrgSameAs(siteData.orgSameAs || '[]')
        setDefaultOgImage(siteData.defaultOgImage || '')
        setPages(pagesData)
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
          defaultOgImage,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePageSave = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId)
    if (!page) return

    setPageSaving(pageId)
    setPageSaved(null)
    try {
      await fetch(`/api/seo/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          description: page.description,
          keywords: page.keywords,
          noIndex: page.noIndex,
          ogImage: page.ogImage,
        }),
      })
      setPageSaved(pageId)
      setTimeout(() => setPageSaved(null), 2000)
    } catch (err) {
      console.error('Failed to save page settings:', err)
      toast.error('Failed to save page settings')
    } finally {
      setPageSaving(null)
    }
  }

  const updatePage = (pageId: string, field: keyof PageSeoData, value: string | boolean | null) => {
    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, [field]: value } : p
    ))
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

      {/* Default OG Image */}
      <Card>
        <CardHeader>
          <CardTitle>Default Social Preview Image</CardTitle>
          <CardDescription>
            Fallback image used for social previews when pages don't have a custom OG image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OgImageUpload
            value={defaultOgImage}
            onChange={setDefaultOgImage}
            disabled={saving}
            label="Default OG Image"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Site Settings'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Saved!
          </span>
        )}
      </div>

      {/* Per-Page SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Page-Specific SEO</CardTitle>
          <CardDescription>
            Configure SEO settings for individual static pages. Leave fields empty to use site defaults.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No configurable pages found.</p>
          ) : (
            pages.map(page => (
              <div key={page.id} className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setExpandedPage(expandedPage === page.id ? null : page.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{page.name}</div>
                    <div className="text-sm text-muted-foreground">{page.path}</div>
                  </div>
                  {expandedPage === page.id ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedPage === page.id && (
                  <div className="p-4 pt-0 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor={`${page.id}-title`}>Page Title</Label>
                      <Input
                        id={`${page.id}-title`}
                        value={page.title || ''}
                        onChange={e => updatePage(page.id, 'title', e.target.value || null)}
                        placeholder="Leave empty for site default"
                        disabled={pageSaving === page.id}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${page.id}-description`}>Meta Description</Label>
                      <Textarea
                        id={`${page.id}-description`}
                        value={page.description || ''}
                        onChange={e => updatePage(page.id, 'description', e.target.value || null)}
                        placeholder="Leave empty for site default"
                        className="min-h-[80px] resize-none"
                        disabled={pageSaving === page.id}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${page.id}-keywords`}>Keywords</Label>
                      <Input
                        id={`${page.id}-keywords`}
                        value={page.keywords || ''}
                        onChange={e => updatePage(page.id, 'keywords', e.target.value || null)}
                        placeholder="Comma-separated keywords"
                        disabled={pageSaving === page.id}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${page.id}-noindex`}
                        checked={page.noIndex}
                        onChange={e => updatePage(page.id, 'noIndex', e.target.checked)}
                        disabled={pageSaving === page.id}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`${page.id}-noindex`} className="font-normal">
                        Hide from search engines (noindex)
                      </Label>
                    </div>

                    <OgImageUpload
                      value={page.ogImage || ''}
                      onChange={(url) => updatePage(page.id, 'ogImage', url || null)}
                      disabled={pageSaving === page.id}
                      label="OG Image"
                    />

                    <SocialPreviews
                      title={page.title || page.name}
                      description={page.description || siteDescription}
                      imageUrl={page.ogImage || defaultOgImage || null}
                      url={`yourdomain.com${page.path}`}
                      siteName={siteTitle || undefined}
                    />

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handlePageSave(page.id)}
                        disabled={pageSaving === page.id}
                      >
                        {pageSaving === page.id && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        {pageSaving === page.id ? 'Saving...' : 'Save'}
                      </Button>
                      {pageSaved === page.id && (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Saved!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
