'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { ChevronRightIcon } from '@/components/Icons'
import { hoverBgClass } from '@/lib/styles'

interface EssayLinkProps {
  slug: string
  title: string
  subtitle: string | null
  polyhedraShape: string | null
  index: number
}

export function EssayLink({ slug, title, subtitle, polyhedraShape, index }: EssayLinkProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/e/${slug}`}
      className={`group block w-full text-left border-b border-gray-200 dark:border-gray-800 transition-colors ${hoverBgClass} px-6 py-5`}
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
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-section font-medium mb-1 transition-colors dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400">
            {title}
          </h3>
          {subtitle && (
            <p className="text-body text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  )
}
