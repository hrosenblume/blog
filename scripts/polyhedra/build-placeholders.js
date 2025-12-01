/**
 * Build Polyhedra Placeholders
 * 
 * Generates transparent animated GIF placeholders for all polyhedra shapes.
 * These are used as instant placeholders before the Canvas animation loads.
 * 
 * Usage: node scripts/polyhedra/build-placeholders.js
 */

const { createCanvas } = require('canvas')
const GIFEncoder = require('gif-encoder-2')
const fs = require('fs')
const path = require('path')

// Load shapes data
const shapesPath = path.join(__dirname, '../../lib/polyhedra/shapes.json')
const shapes = JSON.parse(fs.readFileSync(shapesPath, 'utf8'))

// Output directory
const outputDir = path.join(__dirname, '../../public/polyhedra/placeholders')

// GIF settings
const SIZE = 60            // Image size (matches default PolyhedraCanvas size)
const FPS = 15             // Frames per second
const DURATION = 4         // Full rotation in seconds (matches canvas BASE_SPEED)
const TOTAL_FRAMES = FPS * DURATION  // 60 frames for one full rotation

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

// Fixed tilt angles (matching PolyhedraCanvas)
const ANGLE_X = 0.4
const ANGLE_Z = 0.2

// Vertex color matching renderer.ts
const VERTEX_COLOR = '#2a2a2a'

// Number of frames (for syncing with canvas)
const FRAME_COUNT = TOTAL_FRAMES  // 60 frames

/**
 * Normalize vertices: center at origin and scale by circumradius
 * Must match normalizeVertices in renderer.ts
 */
function normalizeVertices(vertices) {
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
  ])
  
  const circumradius = Math.max(...centered.map(v => 
    Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
  ))
  
  return centered.map(v => v.map(c => c / circumradius))
}

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
function projectPoint(point, size, scale = 0.38) {
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

/**
 * Draw a single frame of the polyhedron
 */
function renderFrame(ctx, shapeName, shape, size, angleY) {
  const { vertices: rawVertices, edges } = shape
  
  // Normalize vertices (must match PolyhedraCanvas)
  const vertices = normalizeVertices(rawVertices)
  
  // Clear canvas (transparent)
  ctx.clearRect(0, 0, size, size)
  
  // Get deterministic edge colors based on shape name
  // Must match PolyhedraCanvas logic: create array of N colors, then shuffle
  const seed = hashString(shapeName)
  const edgeColors = seededShuffle(
    edges.map((_, i) => EDGE_COLORS[i % EDGE_COLORS.length]),
    seed
  )
  
  // Rotate all vertices
  const rotated = vertices.map(v => rotatePoint(v, ANGLE_X, angleY, ANGLE_Z))
  
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
    const color = edgeColors[edge.index]
    
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

/**
 * Generate an animated GIF for a shape
 */
function generateGif(shapeName, shape) {
  const encoder = new GIFEncoder(SIZE, SIZE, 'neuquant', true)  // true = use optimizer
  const outputPath = path.join(outputDir, `${shapeName}.gif`)
  
  encoder.start()
  encoder.setRepeat(0)      // Loop forever
  encoder.setDelay(1000 / FPS)  // Frame delay in ms
  encoder.setQuality(10)    // Image quality (1-30, lower = better but slower)
  encoder.setTransparent(0x000000)  // Black as transparent color
  
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')
  
  // Render each frame
  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const angleY = (frame / TOTAL_FRAMES) * Math.PI * 2
    renderFrame(ctx, shapeName, shape, SIZE, angleY)
    encoder.addFrame(ctx)
  }
  
  encoder.finish()
  
  // Write the buffer to file
  const buffer = encoder.out.getData()
  fs.writeFileSync(outputPath, buffer)
}

// Main build
function main() {
  console.log('Building polyhedra placeholders (animated GIFs)...\n')
  console.log(`Settings: ${SIZE}px, ${FPS}fps, ${DURATION}s rotation, ${TOTAL_FRAMES} frames\n`)

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const shapeNames = Object.keys(shapes)
  let count = 0

  for (const shapeName of shapeNames) {
    const shape = shapes[shapeName]
    generateGif(shapeName, shape)
    count++
    process.stdout.write(`\rGenerated ${count}/${shapeNames.length}: ${shapeName}`)
  }

  console.log(`\n\nGenerated ${count} animated GIFs in ${outputDir}`)
}

main()

