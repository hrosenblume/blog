'use client'

import { PolyhedraCanvas } from '@/components/PolyhedraCanvas'
import { CenteredPage } from '@/components/CenteredPage'

export function PageLoader() {
  return (
    <CenteredPage>
      <PolyhedraCanvas 
        shape="square_trapezohedron" 
        size={60}
        hovered
        alwaysAnimate
      />
    </CenteredPage>
  )
}
