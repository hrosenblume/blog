'use client'

import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { getRandomShape } from '@/lib/polyhedra/shapes'
import type { CustomFieldProps } from 'autoblogger'

// Compact polyhedra field for footer position - matches original design
export function PolyhedraField({ value, onChange, disabled }: CustomFieldProps<string>) {
  const currentShape = value || 'cube'

  const handleRandomize = () => {
    if (disabled) return
    onChange(getRandomShape())
  }

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2 min-w-0">
        <PolyhedraCanvas shape={currentShape} size={36} />
        <span
          className="text-muted-foreground font-mono text-xs truncate max-w-[100px] md:max-w-none"
          title={currentShape}
        >
          {currentShape}
        </span>
      </div>
      <button
        type="button"
        onClick={handleRandomize}
        disabled={disabled}
        className="flex-shrink-0 px-2.5 py-1 text-xs rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Regenerate
      </button>
    </div>
  )
}
