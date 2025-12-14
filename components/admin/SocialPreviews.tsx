'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ImageIcon } from 'lucide-react'

interface SocialPreviewsProps {
  title: string
  description: string
  imageUrl: string | null
  url: string
  siteName?: string
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
    </div>
  )
}

function IMessagePreview({ title, imageUrl, url }: SocialPreviewsProps) {
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]
  
  return (
    <div className="bg-[#e9e9eb] dark:bg-[#3a3a3c] rounded-2xl overflow-hidden max-w-[280px]">
      <div className="aspect-[1.91/1] bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-[#1c1c1e] dark:text-white truncate">
          {title || 'Page Title'}
        </p>
        <p className="text-xs text-[#8e8e93] truncate">
          {domain}
        </p>
      </div>
    </div>
  )
}

function SlackPreview({ title, description, imageUrl, url }: SocialPreviewsProps) {
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]
  
  return (
    <div className="flex gap-2 max-w-[400px]">
      <div className="w-1 bg-[#36c5f0] rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{domain}</p>
        <p className="text-sm font-bold text-[#1264a3] dark:text-[#1d9bd1] truncate">
          {title || 'Page Title'}
        </p>
        {description && (
          <p className="text-sm text-foreground line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
        {imageUrl && (
          <div className="mt-2 rounded overflow-hidden max-w-[200px]">
            <img src={imageUrl} alt="" className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  )
}

function TwitterPreview({ title, description, imageUrl, url }: SocialPreviewsProps) {
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]
  
  return (
    <div className="border rounded-2xl overflow-hidden max-w-[500px] bg-background">
      <div className="aspect-[1.91/1] bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="px-3 py-2 border-t">
        <p className="text-[13px] text-muted-foreground truncate">{domain}</p>
        <p className="text-[15px] font-normal text-foreground truncate">
          {title || 'Page Title'}
        </p>
        {description && (
          <p className="text-[15px] text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function LinkedInPreview({ title, imageUrl, url }: SocialPreviewsProps) {
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]
  
  return (
    <div className="border rounded-lg overflow-hidden max-w-[500px] bg-background">
      <div className="aspect-[1.91/1] bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="px-3 py-2 bg-[#f3f2ef] dark:bg-[#1b1f23]">
        <p className="text-sm font-semibold text-foreground truncate">
          {title || 'Page Title'}
        </p>
        <p className="text-xs text-muted-foreground truncate">{domain}</p>
      </div>
    </div>
  )
}

function DiscordPreview({ title, description, imageUrl, url, siteName }: SocialPreviewsProps) {
  return (
    <div className="flex max-w-[400px]">
      <div className="w-1 bg-[#5865f2] rounded-l flex-shrink-0" />
      <div className="flex-1 bg-[#2f3136] rounded-r p-3 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">
          {siteName || url.replace(/^https?:\/\//, '').split('/')[0]}
        </p>
        <p className="text-sm font-semibold text-[#00aff4] truncate">
          {title || 'Page Title'}
        </p>
        {description && (
          <p className="text-sm text-[#dcddde] line-clamp-2 mt-1">
            {description}
          </p>
        )}
        {imageUrl && (
          <div className="mt-3 rounded overflow-hidden">
            <img src={imageUrl} alt="" className="max-w-full max-h-[200px] object-cover rounded" />
          </div>
        )}
      </div>
    </div>
  )
}

export function SocialPreviews(props: SocialPreviewsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border-t pt-4 mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span>Social Previews</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* iMessage */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="text-base">💬</span> iMessage
            </p>
            <IMessagePreview {...props} />
          </div>

          {/* Slack */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="text-base">💼</span> Slack
            </p>
            <SlackPreview {...props} />
          </div>

          {/* Twitter/X */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="text-base">🐦</span> Twitter / X
            </p>
            <TwitterPreview {...props} />
          </div>

          {/* LinkedIn */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="text-base">💼</span> LinkedIn
            </p>
            <LinkedInPreview {...props} />
          </div>

          {/* Discord */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className="text-base">🎮</span> Discord
            </p>
            <DiscordPreview {...props} />
          </div>
        </div>
      )}
    </div>
  )
}
