'use client'

import { useRef, useEffect, useState } from 'react'
import { SHAPES } from '@/lib/polyhedra/shapes'
import { 
  renderFrame, 
  normalizeVertices, 
  EDGE_COLORS, 
  seededShuffle, 
  hashString,
} from '@/lib/polyhedra/renderer'

interface PolyhedraCanvasProps {
  shape: string
  size?: number
  className?: string
  index?: number  // Used to cycle through fallback GIFs (0-5)
  hovered?: boolean  // Speed up rotation on hover
  clicked?: boolean  // Even faster spin on click (before navigation)
}

// 6 fallback GIFs for when JavaScript is disabled
const FALLBACK_COUNT = 6

// Rotation speeds (radians per millisecond)
const BASE_SPEED = (2 * Math.PI) / 4000    // Full rotation in 4 seconds
const HOVER_SPEED = (2 * Math.PI) / 375    // Full rotation in 0.375 seconds (~10x base)
const CLICK_SPEED = (2 * Math.PI) / 100    // Full rotation in 0.1 seconds (~40x base)
const ACCELERATION = 0.004                  // How fast speed changes (higher = snappier)

export function PolyhedraCanvas({ shape, size = 60, className = '', index = 0, hovered = false, clicked = false }: PolyhedraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const angleRef = useRef<number>(0)        // Current rotation angle
  const speedRef = useRef<number>(BASE_SPEED)  // Current speed (smoothly interpolated)
  const lastTimeRef = useRef<number | null>(null)
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

    const animate = (timestamp: number) => {
      // Calculate delta time
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Smoothly accelerate/decelerate towards target speed
      // Priority: clicked > hovered > base
      const targetSpeed = clicked ? CLICK_SPEED : hovered ? HOVER_SPEED : BASE_SPEED
      speedRef.current += (targetSpeed - speedRef.current) * ACCELERATION * deltaTime
      
      // Update angle based on current interpolated speed
      angleRef.current += speedRef.current * deltaTime
      
      // Keep angle in [0, 2π] range
      angleRef.current = angleRef.current % (2 * Math.PI)

      ctx.clearRect(0, 0, size, size)
      renderFrame(ctx, vertices, edges, edgeColors, size, angleX, angleRef.current, angleZ)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [shape, size, isVisible, prefersReducedMotion, hovered, clicked])

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
