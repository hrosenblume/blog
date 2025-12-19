'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Tag {
  id: string
  name: string
}

interface TagsSectionProps {
  tags: Tag[]
  onTagsChange: (tagIds: string[]) => void
  disabled?: boolean
}

export function TagsSection({
  tags,
  onTagsChange,
  disabled = false,
}: TagsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch available tags when section expands
  useEffect(() => {
    if (isExpanded && availableTags.length === 0) {
      setLoading(true)
      fetch('/api/tags')
        .then(res => res.json())
        .then(data => {
          setAvailableTags(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isExpanded, availableTags.length])

  const handleAddTag = (tagId: string) => {
    if (!tags.some(t => t.id === tagId)) {
      const tagToAdd = availableTags.find(t => t.id === tagId)
      if (tagToAdd) {
        onTagsChange([...tags.map(t => t.id), tagId])
      }
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter(t => t.id !== tagId).map(t => t.id))
  }

  // Tags not already selected
  const unselectedTags = availableTags.filter(
    at => !tags.some(t => t.id === at.id)
  )

  const tagSummary = tags.length === 0
    ? 'no tags'
    : tags.length === 1
    ? '1 tag'
    : `${tags.length} tags`

  return (
    <div className="border-t border-border pt-4">
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
        <span>Tags</span>
        <span className="ml-auto text-xs text-muted-foreground">{tagSummary}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 pl-6">
          {/* Selected tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                >
                  {tag.name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Add tag select */}
          {!disabled && (
            <>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading tags...</p>
              ) : unselectedTags.length > 0 ? (
                <div className="max-w-[200px]">
                  <Select onValueChange={handleAddTag} value="">
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Add tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unselectedTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : availableTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tags available. Create tags in Admin.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">All tags added</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

