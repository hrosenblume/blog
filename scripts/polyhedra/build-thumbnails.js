/**
 * Build Polyhedra Thumbnails
 * 
 * Generates static PNG thumbnails for all polyhedra shapes.
 * These are used for OpenGraph/social media preview images.
 * 
 * Usage: node scripts/polyhedra/build-thumbnails.js
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// Load shapes data
const shapesPath = path.join(__dirname, '../../lib/polyhedra/shapes.json')
const shapes = JSON.parse(fs.readFileSync(shapesPath, 'utf8'))

// Output directory
const outputDir = path.join(__dirname, '../../public/polyhedra/thumbnails')

// Thumbnail size (square for social media compact previews)
const SIZE = 128

// Colors matching the client-side renderer
const EDGE_COLORS = [
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

// Fixed rotation angle for thumbnails (looks good for most shapes)
const ANGLE_X = 0.5
const ANGLE_Y = 0.8
const ANGLE_Z = 0.3

/**
 * Rotate a 3D point around X, Y, Z axes
 */
function rotatePoint(point, angleX, angleY, angleZ) {
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
function projectPoint(point, size, scale = 0.42) {
  const [x, y] = point
  const center = size / 2
  return [center + x * size * scale, center - y * size * scale]
}

/**
 * Generate a numeric hash from a string (for deterministic color shuffling)
 */
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Shuffle array deterministically based on seed
 */
function seededShuffle(array, seed) {
  const arr = [...array]
  let m = arr.length
  
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

// Dark charcoal background for social previews
const BG_COLOR = '#2d2d2d'
const VERTEX_COLOR = '#1a1a1a'

/**
 * Draw the polyhedron to a canvas
 */
function renderShape(ctx, shapeName, shape, size) {
  const { vertices, edges } = shape
  
  // Clear with dark charcoal background
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, size, size)
  
  // Get deterministic edge colors based on shape name
  const seed = hashString(shapeName)
  const edgeColors = seededShuffle(EDGE_COLORS, seed)
  
  // Rotate all vertices
  const rotated = vertices.map(v => rotatePoint(v, ANGLE_X, ANGLE_Y, ANGLE_Z))
  
  // Calculate edge thickness based on size
  const thickness = Math.max(2, Math.floor(size / 40))
  const vertexRadius = Math.max(2, Math.floor(size / 35))
  
  // Sort edges by average z-depth for proper rendering (back to front)
  const edgeDepths = edges.map((edge, i) => {
    const avgZ = (rotated[edge[0]][2] + rotated[edge[1]][2]) / 2
    return { z: avgZ, index: i, v1: edge[0], v2: edge[1] }
  })
  edgeDepths.sort((a, b) => {
    const zDiff = a.z - b.z
    if (Math.abs(zDiff) < 0.001) return a.index - b.index
    return zDiff
  })
  
  // Sort vertices by z-depth
  const vertexDepths = rotated.map((v, i) => ({ z: v[2], index: i, vertex: v }))
  vertexDepths.sort((a, b) => a.z - b.z)
  
  // Draw edges back to front
  for (const edge of edgeDepths) {
    const p1 = projectPoint(rotated[edge.v1], size)
    const p2 = projectPoint(rotated[edge.v2], size)
    const color = edgeColors[edge.index % edgeColors.length]
    
    ctx.beginPath()
    ctx.moveTo(p1[0], p1[1])
    ctx.lineTo(p2[0], p2[1])
    ctx.strokeStyle = color
    ctx.lineWidth = thickness * 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }
  
  // Draw vertices back to front (on top of all edges)
  for (const vertex of vertexDepths) {
    const p = projectPoint(vertex.vertex, size)
    
    ctx.beginPath()
    ctx.arc(p[0], p[1], vertexRadius, 0, Math.PI * 2)
    ctx.fillStyle = VERTEX_COLOR
    ctx.fill()
  }
}

// Main build
console.log('Building polyhedra thumbnails...\n')

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const shapeNames = Object.keys(shapes)
let count = 0

for (const shapeName of shapeNames) {
  const shape = shapes[shapeName]
  
  // Create canvas
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')
  
  // Render shape
  renderShape(ctx, shapeName, shape, SIZE)
  
  // Save as PNG
  const outputPath = path.join(outputDir, `${shapeName}.png`)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)
  
  count++
}

console.log(`Generated ${count} thumbnails in ${outputDir}`)

