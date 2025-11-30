'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

  const handleClick = () => {
    setClicked(true)
    // Short delay to show the fast spin, then navigate
    setTimeout(() => {
      router.push(`/e/${slug}`)
    }, 250)
  }

  return (
    <button
      onClick={handleClick}
      className="group block w-full text-left border-b border-border transition-colors hover:bg-accent px-6 py-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          <h3 className="text-section font-medium mb-1 transition-colors group-hover:text-muted-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-body text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </button>
  )
}
