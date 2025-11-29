'use client'

import { useRef, useEffect, useState } from 'react'
import { getShape, SHAPES } from '@/lib/polyhedra/shapes'
import { 
  renderFrame, 
  normalizeVertices, 
  EDGE_COLORS, 
  seededShuffle, 
  hashString,
  type Point3D 
} from '@/lib/polyhedra/renderer'

interface PolyhedraCanvasProps {
  shape: string
  size?: number
  className?: string
  index?: number  // Used to cycle through fallback GIFs (0-5)
  hovered?: boolean  // Speed up rotation on hover
}

// 6 fallback GIFs for when JavaScript is disabled
const FALLBACK_COUNT = 6

export function PolyhedraCanvas({ shape, size = 60, className = '', index = 0, hovered = false }: PolyhedraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Cycle through fallbacks so adjacent posts have different shapes
  const fallbackIndex = index % FALLBACK_COUNT

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Intersection observer for visibility
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get shape data, fallback to cube if not found
    let shapeData = SHAPES[shape]
    if (!shapeData) {
      console.warn(`Shape "${shape}" not found, using cube`)
      shapeData = SHAPES.cube
    }

    // Normalize vertices
    const vertices = normalizeVertices(shapeData.vertices)
    const edges = shapeData.edges

    // Deterministic edge colors based on shape name
    const seed = hashString(shape)
    const edgeColors = seededShuffle(
      edges.map((_, i) => EDGE_COLORS[i % EDGE_COLORS.length]),
      seed
    )

    // Fixed tilt angles
    const angleX = 0.4
    const angleZ = 0.2

    // Render static frame if reduced motion or not visible
    const renderStatic = () => {
      ctx.clearRect(0, 0, size, size)
      renderFrame(ctx, vertices, edges, edgeColors, size, angleX, 0, angleZ)
    }

    // Animate if visible and motion allowed
    if (!isVisible || prefersReducedMotion) {
      renderStatic()
      return
    }

    let startTime: number | null = null
    let lastAngleY = 0
    const baseDuration = 4000 // 4 seconds per rotation (normal)
    const hoverDuration = 1500 // 1.5 seconds per rotation (fast)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const duration = hovered ? hoverDuration : baseDuration
      const angleY = ((elapsed % duration) / duration) * Math.PI * 2

      ctx.clearRect(0, 0, size, size)
      renderFrame(ctx, vertices, edges, edgeColors, size, angleX, angleY, angleZ)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [shape, size, isVisible, prefersReducedMotion, hovered])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Fallback GIF for when JavaScript is disabled */}
      <noscript>
        <img 
          src={`/polyhedra/fallback-${fallbackIndex}.gif`}
          alt={`Animated polyhedron`}
          width={size}
          height={size}
        />
      </noscript>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        aria-label={`Animated ${shape} polyhedron`}
      />
    </div>
  )
}

