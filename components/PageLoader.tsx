'use client'

import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <PolyhedraCanvas 
        shape="square_trapezohedron" 
        size={60}
        hovered
        alwaysAnimate
      />
    </div>
  )
}
