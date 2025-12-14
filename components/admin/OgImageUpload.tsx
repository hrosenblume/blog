'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OgImageUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  label?: string
}

export function OgImageUpload({
  value,
  onChange,
  disabled = false,
  label = 'OG Image',
}: OgImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('File too large. Maximum size is 4MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url } = await response.json()
      onChange(url)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleClear = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      
      {value ? (
        // Image preview
        <div className="relative group">
          <div className="border rounded-lg overflow-hidden bg-muted">
            <img
              src={value}
              alt="OG Preview"
              className="w-full h-auto max-h-48 object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-1 truncate">{value}</p>
        </div>
      ) : (
        // Upload zone
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleInputChange}
            disabled={disabled || uploading}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Drop image here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1200 x 630px (1.91:1 ratio)
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, GIF, WebP · Max 4MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL input as fallback */}
      <div className="flex gap-2">
        <Input
          placeholder="Or paste image URL..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="text-xs"
        />
      </div>
    </div>
  )
}
