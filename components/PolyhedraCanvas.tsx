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
  index?: number
  hovered?: boolean  // Speed up rotation on hover
  clicked?: boolean  // Even faster spin on click (before navigation)
  acceleration?: number  // Override acceleration rate (default 0.004, higher = faster ramp)
  alwaysAnimate?: boolean  // Skip visibility check (for loaders)
}

// Rotation speeds (radians per millisecond)
const ROTATION_PERIOD_MS = 4000  // 4 seconds for one full rotation
const BASE_SPEED = (2 * Math.PI) / ROTATION_PERIOD_MS
const HOVER_SPEED = (2 * Math.PI) / 375    // Full rotation in 0.375 seconds (~10x base)
const CLICK_SPEED = (2 * Math.PI) / 100    // Full rotation in 0.1 seconds (~40x base)
const ACCELERATION = 0.003                  // How fast speed changes (lower = more gradual startup)

export function PolyhedraCanvas({ shape, size = 60, className = '', index = 0, hovered = false, clicked = false, acceleration = ACCELERATION, alwaysAnimate = false }: PolyhedraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const angleRef = useRef<number>(0)        // Current rotation angle - starts at 0 to match PNG
  const speedRef = useRef<number>(0)        // Start at 0, smoothly accelerate to BASE_SPEED
  const lastTimeRef = useRef<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isCanvasReady, setIsCanvasReady] = useState(false)

  // Get shape data (static import - no async loading)
  const shapeData = SHAPES[shape] || SHAPES.cube

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

    // Start at angle 0 - matches the static PNG placeholder exactly
    angleRef.current = 0

    // Render first frame at angle 0 and mark canvas as ready
    ctx.clearRect(0, 0, size, size)
    renderFrame(ctx, vertices, edges, edgeColors, size, angleX, 0, angleZ)
    setIsCanvasReady(true)

    // If reduced motion or not visible, stay at static frame
    if ((!isVisible && !alwaysAnimate) || prefersReducedMotion) {
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
      speedRef.current += (targetSpeed - speedRef.current) * acceleration * deltaTime
      
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
  }, [shape, size, isVisible, prefersReducedMotion, hovered, clicked, acceleration, alwaysAnimate, shapeData])

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Static PNG placeholder - shows before JS hydrates, matches canvas frame 0 exactly */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={`/polyhedra/placeholders/${shape}.png`}
        alt=""
        width={size}
        height={size}
        className={`absolute inset-0 ${isCanvasReady ? 'hidden' : 'block'}`}
        style={{ objectFit: 'contain' }}
        onError={(e) => {
          e.currentTarget.src = '/polyhedra/placeholders/cube.png'
        }}
      />
      
      {/* Fallback for when JavaScript is disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`/polyhedra/placeholders/${shape}.png`}
          alt="Polyhedron"
          width={size}
          height={size}
        />
      </noscript>
      
      {/* Canvas - instant switch, same frame as PNG */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        aria-label={`Animated ${shape} polyhedron`}
        className={`absolute inset-0 ${isCanvasReady ? 'block' : 'hidden'}`}
      />
    </div>
  )
}
