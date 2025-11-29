/**
 * Client-side polyhedra renderer using HTML5 Canvas.
 * Ported from scripts/generate-polyhedra.js for browser use.
 */

// Types
export type Point3D = [number, number, number]
export type Point2D = [number, number]
export type Edge = [number, number]
export type RGB = [number, number, number]

export interface Shape {
  vertices: Point3D[]
  edges: Edge[]
}

// Colors matching the reference images - pure saturated colors
export const EDGE_COLORS = [
  '#FF0000',  // red
  '#00FF00',  // green
  '#0000FF',  // blue
  '#00FFFF',  // cyan
  '#FF00FF',  // magenta
  '#FFFF00',  // yellow
  '#FF8000',  // orange
  '#FF0080',  // pink/rose
  '#80FF00',  // lime
  '#00FF80',  // spring green
  '#0080FF',  // sky blue
  '#8000FF',  // purple
]

/**
 * Rotate a 3D point around X, Y, Z axes
 */
export function rotatePoint(point: Point3D, angleX: number, angleY: number, angleZ: number): Point3D {
  let [x, y, z] = point
  
  // Rotate around X axis
  const cosX = Math.cos(angleX), sinX = Math.sin(angleX)
  ;[y, z] = [y * cosX - z * sinX, y * sinX + z * cosX]
  
  // Rotate around Y axis
  const cosY = Math.cos(angleY), sinY = Math.sin(angleY)
  ;[x, z] = [x * cosY + z * sinY, -x * sinY + z * cosY]
  
  // Rotate around Z axis
  const cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ)
  ;[x, y] = [x * cosZ - y * sinZ, x * sinZ + y * cosZ]
  
  return [x, y, z]
}

/**
 * Project a 3D point to 2D screen coordinates
 */
export function projectPoint(point: Point3D, size: number, scale = 0.38): Point2D {
  const [x, y] = point
  const center = size / 2
  return [center + x * size * scale, center - y * size * scale]
}

/**
 * Convert hex color to RGB array
 */
export function hexToRgb(hex: string): RGB {
  hex = hex.replace('#', '')
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
  ]
}

/**
 * Darken an RGB color
 */
export function darkenColor(rgb: RGB, factor = 0.5): RGB {
  return rgb.map(c => Math.floor(c * factor)) as RGB
}

/**
 * Lighten an RGB color
 */
export function lightenColor(rgb: RGB, factor = 0.3): RGB {
  return rgb.map(c => Math.min(255, Math.floor(c + (255 - c) * factor))) as RGB
}

/**
 * Convert RGB array to hex string
 */
export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('')
}

/**
 * Draw a 3D cylindrical edge with shading
 */
export function draw3DEdge(
  ctx: CanvasRenderingContext2D,
  p1: Point2D,
  p2: Point2D,
  colorHex: string,
  thickness: number
): void {
  const rgb = hexToRgb(colorHex)
  const dark = darkenColor(rgb, 0.4)
  const highlight = lightenColor(rgb, 0.2)
  
  // Calculate perpendicular direction for the edge thickness
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const length = Math.sqrt(dx * dx + dy * dy)
  
  if (length < 1) return
  
  // Perpendicular unit vector
  const px = -dy / length
  const py = dx / length
  
  // Draw multiple layers to create 3D tube effect
  const layers: { offset: number; color: RGB; half?: boolean }[] = [
    { offset: 1.0, color: dark },
    { offset: 0.75, color: rgb },
    { offset: 0.5, color: highlight, half: true }
  ]
  
  for (const layer of layers) {
    const offset = thickness * layer.offset
    
    ctx.beginPath()
    if (layer.half) {
      // Slight highlight on one side only
      ctx.moveTo(p1[0] + px * offset * 0.5, p1[1] + py * offset * 0.5)
      ctx.lineTo(p2[0] + px * offset * 0.5, p2[1] + py * offset * 0.5)
      ctx.lineTo(p2[0] + px * offset, p2[1] + py * offset)
      ctx.lineTo(p1[0] + px * offset, p1[1] + py * offset)
    } else {
      ctx.moveTo(p1[0] + px * offset, p1[1] + py * offset)
      ctx.lineTo(p2[0] + px * offset, p2[1] + py * offset)
      ctx.lineTo(p2[0] - px * offset, p2[1] - py * offset)
      ctx.lineTo(p1[0] - px * offset, p1[1] - py * offset)
    }
    ctx.closePath()
    ctx.fillStyle = rgbToHex(layer.color)
    ctx.fill()
  }
}

/**
 * Draw a vertex sphere with highlight
 */
export function drawVertexSphere(
  ctx: CanvasRenderingContext2D,
  center: Point2D,
  radius: number
): void {
  const [x, y] = center
  
  // Main dark sphere
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = '#1a1a1a'
  ctx.fill()
  
  // Subtle highlight
  const highlightR = radius * 0.4
  const highlightOffset = radius * 0.3
  ctx.beginPath()
  ctx.arc(x - highlightOffset, y - highlightOffset, highlightR, 0, Math.PI * 2)
  ctx.fillStyle = '#3a3a3a'
  ctx.fill()
}

/**
 * Render a complete frame of the polyhedron
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  vertices: Point3D[],
  edges: Edge[],
  edgeColors: string[],
  size: number,
  angleX: number,
  angleY: number,
  angleZ: number
): void {
  // Rotate all vertices
  const rotated = vertices.map(v => rotatePoint(v, angleX, angleY, angleZ))
  
  // Calculate edge thickness based on size
  const thickness = Math.max(2, Math.floor(size / 40))
  const vertexRadius = Math.max(3, Math.floor(size / 25))
  
  // Sort edges by average z-depth for proper rendering (back to front)
  const edgeDepths = edges.map((edge, i) => {
    const avgZ = (rotated[edge[0]][2] + rotated[edge[1]][2]) / 2
    return { z: avgZ, index: i, v1: edge[0], v2: edge[1] }
  })
  edgeDepths.sort((a, b) => a.z - b.z)
  
  // Sort vertices by z-depth
  const vertexDepths = rotated.map((v, i) => ({ z: v[2], index: i, vertex: v }))
  vertexDepths.sort((a, b) => a.z - b.z)
  
  // Collect all drawing operations with their z-depths
  type DrawOp = 
    | { z: number; type: 'edge'; p1: Point2D; p2: Point2D; color: string; thickness: number }
    | { z: number; type: 'vertex'; p: Point2D; radius: number }
  
  const drawOps: DrawOp[] = []
  
  // Add edge drawing operations
  for (const edge of edgeDepths) {
    const p1 = projectPoint(rotated[edge.v1], size)
    const p2 = projectPoint(rotated[edge.v2], size)
    drawOps.push({ z: edge.z, type: 'edge', p1, p2, color: edgeColors[edge.index], thickness })
  }
  
  // Add vertex drawing operations
  for (const vertex of vertexDepths) {
    const p = projectPoint(vertex.vertex, size)
    drawOps.push({ z: vertex.z, type: 'vertex', p, radius: vertexRadius })
  }
  
  // Sort all operations by z-depth and draw back to front
  drawOps.sort((a, b) => a.z - b.z)
  
  for (const op of drawOps) {
    if (op.type === 'edge') {
      draw3DEdge(ctx, op.p1, op.p2, op.color, op.thickness)
    } else if (op.type === 'vertex') {
      drawVertexSphere(ctx, op.p, op.radius)
    }
  }
}

/**
 * Normalize vertices: center at origin and scale by circumradius
 */
export function normalizeVertices(vertices: Point3D[]): Point3D[] {
  // Center at origin
  const xs = vertices.map(v => v[0])
  const ys = vertices.map(v => v[1])
  const zs = vertices.map(v => v[2])
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
  const centerZ = (Math.min(...zs) + Math.max(...zs)) / 2
  
  let centered = vertices.map(v => [
    v[0] - centerX,
    v[1] - centerY,
    v[2] - centerZ
  ] as Point3D)
  
  // Scale by circumradius
  const circumradius = Math.max(...centered.map(v => 
    Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
  ))
  
  return centered.map(v => v.map(c => c / circumradius) as Point3D)
}

/**
 * Shuffle array deterministically based on seed
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array]
  let m = arr.length
  
  // Simple seeded random
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  
  while (m) {
    const i = Math.floor(random() * m--)
    ;[arr[m], arr[i]] = [arr[i], arr[m]]
  }
  
  return arr
}

/**
 * Generate a numeric hash from a string (for deterministic color shuffling)
 */
export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

