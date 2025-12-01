'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { ChevronRightIcon } from '@/components/Icons'

interface EssayLinkProps {
  slug: string
  title: string
  subtitle: string | null
  polyhedraShape: string | null
  index: number
}

export function EssayLink({ slug, title, subtitle, polyhedraShape, index }: EssayLinkProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Allow cmd/ctrl+click to open in new tab naturally
    if (e.metaKey || e.ctrlKey) return
    
    if (clicked) return

    e.preventDefault()
    setClicked(true)
    // Ensure at least 200ms of fast spin before navigation
    setTimeout(() => {
      router.push(`/e/${slug}`)
    }, 200)
  }

  return (
    <Link
      href={`/e/${slug}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group block w-full text-left border-b border-border transition-all duration-200 can-hover:hover:bg-accent can-hover:hover:shadow-sm can-hover:hover:-translate-y-0.5 px-6 py-5 animate-fade-in-up"
      style={{ animationDelay: `${200 + index * 75}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-[60px] h-[60px] rounded overflow-hidden">
          <PolyhedraCanvas 
            shape={polyhedraShape || 'cube'} 
            size={60}
            index={index}
            hovered={hovered}
            clicked={clicked}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-section font-medium mb-1 transition-colors can-hover:group-hover:text-muted-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-body text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        <ChevronRightIcon className="w-5 h-5 text-muted-foreground can-hover:group-hover:text-foreground can-hover:group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  )
}
