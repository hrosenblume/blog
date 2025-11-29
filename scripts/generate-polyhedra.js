/**
 * Generate animated rotating 3D polyhedra GIFs with cylindrical edges.
 * Port of the Python generator to Node.js using canvas.
 * 
 * Now includes 175+ unique polyhedra shapes:
 * - 5 Platonic solids
 * - 13 Archimedean solids
 * - 13 Catalan solids
 * - 4 Kepler-Poinsot star polyhedra
 * - 92 Johnson solids (J1-J92)
 * - 48+ parametric shapes (prisms, antiprisms, pyramids, bipyramids, trapezohedra)
 * 
 * Can be used as a module:
 *   const { generatePolyhedronGif } = require('./scripts/generate-polyhedra');
 *   await generatePolyhedronGif({ output: 'public/polyhedra/my-post.gif' });
 * 
 * Or via CLI:
 *   node scripts/generate-polyhedra.js [options]
 *   --shape <name>    Specific shape name (use --list to see all)
 *   --list            List all available shapes
 *   --category <cat>  Random from category (platonic, archimedean, catalan, keplerPoinsot, johnson, parametric)
 *   --size <px>       Image size in pixels (default: 60)
 *   --frames <n>      Number of animation frames (default: 24)
 *   --output <path>   Output file path (default: polyhedra/demo.gif)
 *   --transparent     Use transparent background
 *   --bg <color>      Background color hex (default: #000000)
 *   --duration <ms>   Frame duration in ms (default: 100)
 */

const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

// Import polyhedra from modular structure
const { POLYHEDRA, SHAPE_NAMES, CATEGORIES, getRandomShape, getRandomShapeFromCategory } = require('./polyhedra');

// Colors matching the reference images - pure saturated colors
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
];

function rotatePoint(point, angleX, angleY, angleZ) {
  let [x, y, z] = point;
  
  // Rotate around X axis
  const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
  [y, z] = [y * cosX - z * sinX, y * sinX + z * cosX];
  
  // Rotate around Y axis
  const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
  [x, z] = [x * cosY + z * sinY, -x * sinY + z * cosY];
  
  // Rotate around Z axis
  const cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);
  [x, y] = [x * cosZ - y * sinZ, x * sinZ + y * cosZ];
  
  return [x, y, z];
}

function projectPoint(point, size, scale = 0.38) {
  const [x, y, z] = point;
  const center = size / 2;
  return [center + x * size * scale, center - y * size * scale];
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
  ];
}

function darkenColor(rgb, factor = 0.5) {
  return rgb.map(c => Math.floor(c * factor));
}

function lightenColor(rgb, factor = 0.3) {
  return rgb.map(c => Math.min(255, Math.floor(c + (255 - c) * factor)));
}

function rgbToHex(rgb) {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

function draw3DEdge(ctx, p1, p2, colorHex, thickness) {
  const rgb = hexToRgb(colorHex);
  const dark = darkenColor(rgb, 0.4);
  const highlight = lightenColor(rgb, 0.2);
  
  // Calculate perpendicular direction for the edge thickness
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length < 1) return;
  
  // Perpendicular unit vector
  const px = -dy / length;
  const py = dx / length;
  
  // Draw multiple layers to create 3D tube effect
  const layers = [
    { offset: 1.0, color: dark },
    { offset: 0.75, color: rgb },
    { offset: 0.5, color: highlight, half: true }
  ];
  
  for (const layer of layers) {
    const offset = thickness * layer.offset;
    
    ctx.beginPath();
    if (layer.half) {
      // Slight highlight on one side only
      ctx.moveTo(p1[0] + px * offset * 0.5, p1[1] + py * offset * 0.5);
      ctx.lineTo(p2[0] + px * offset * 0.5, p2[1] + py * offset * 0.5);
      ctx.lineTo(p2[0] + px * offset, p2[1] + py * offset);
      ctx.lineTo(p1[0] + px * offset, p1[1] + py * offset);
    } else {
      ctx.moveTo(p1[0] + px * offset, p1[1] + py * offset);
      ctx.lineTo(p2[0] + px * offset, p2[1] + py * offset);
      ctx.lineTo(p2[0] - px * offset, p2[1] - py * offset);
      ctx.lineTo(p1[0] - px * offset, p1[1] - py * offset);
    }
    ctx.closePath();
    ctx.fillStyle = rgbToHex(layer.color);
    ctx.fill();
  }
}

function drawVertexSphere(ctx, center, radius) {
  const [x, y] = center;
  
  // Main dark sphere
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  
  // Subtle highlight
  const highlightR = radius * 0.4;
  const highlightOffset = radius * 0.3;
  ctx.beginPath();
  ctx.arc(x - highlightOffset, y - highlightOffset, highlightR, 0, Math.PI * 2);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
}

function generateFrame(ctx, vertices, edges, edgeColors, size, angleX, angleY, angleZ) {
  // Rotate all vertices
  const rotated = vertices.map(v => rotatePoint(v, angleX, angleY, angleZ));
  
  // Calculate edge thickness based on size
  const thickness = Math.max(2, Math.floor(size / 40));
  const vertexRadius = Math.max(3, Math.floor(size / 25));
  
  // Sort edges by average z-depth for proper rendering (back to front)
  const edgeDepths = edges.map((edge, i) => {
    const avgZ = (rotated[edge[0]][2] + rotated[edge[1]][2]) / 2;
    return { z: avgZ, index: i, v1: edge[0], v2: edge[1] };
  });
  edgeDepths.sort((a, b) => a.z - b.z);
  
  // Sort vertices by z-depth
  const vertexDepths = rotated.map((v, i) => ({ z: v[2], index: i, vertex: v }));
  vertexDepths.sort((a, b) => a.z - b.z);
  
  // Collect all drawing operations with their z-depths
  const drawOps = [];
  
  // Add edge drawing operations
  for (const edge of edgeDepths) {
    const p1 = projectPoint(rotated[edge.v1], size);
    const p2 = projectPoint(rotated[edge.v2], size);
    drawOps.push({ z: edge.z, type: 'edge', p1, p2, color: edgeColors[edge.index], thickness });
  }
  
  // Add vertex drawing operations
  for (const vertex of vertexDepths) {
    const p = projectPoint(vertex.vertex, size);
    drawOps.push({ z: vertex.z, type: 'vertex', p, radius: vertexRadius });
  }
  
  // Sort all operations by z-depth and draw back to front
  drawOps.sort((a, b) => a.z - b.z);
  
  for (const op of drawOps) {
    if (op.type === 'edge') {
      draw3DEdge(ctx, op.p1, op.p2, op.color, op.thickness);
    } else if (op.type === 'vertex') {
      drawVertexSphere(ctx, op.p, op.radius);
    }
  }
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Default options optimized for essay cards (SEO/performance)
const DEFAULT_OPTIONS = {
  shape: null,      // Random if not specified
  category: null,   // Random from all if not specified
  size: 60,         // 60x60 for essay cards
  frames: 24,       // Reduced from 36 for smaller file size (~33% smaller)
  bgColor: '#000000',
  transparent: true, // Transparent background for essay cards
  duration: 100,    // 100ms per frame (smooth 10fps)
  output: 'polyhedra/demo.gif'
};

async function generatePolyhedronGif(options = {}) {
  const {
    shape = DEFAULT_OPTIONS.shape,
    category = DEFAULT_OPTIONS.category,
    size = DEFAULT_OPTIONS.size,
    frames = DEFAULT_OPTIONS.frames,
    bgColor = DEFAULT_OPTIONS.bgColor,
    transparent = DEFAULT_OPTIONS.transparent,
    duration = DEFAULT_OPTIONS.duration,
    output = DEFAULT_OPTIONS.output
  } = options;
  
  // Pick shape: explicit > category > random
  let shapeName;
  if (shape) {
    shapeName = shape;
  } else if (category) {
    shapeName = getRandomShapeFromCategory(category);
  } else {
    shapeName = getRandomShape();
  }
  
  const polyhedron = POLYHEDRA[shapeName];
  if (!polyhedron) {
    throw new Error(`Unknown shape: ${shapeName}. Use --list to see available shapes.`);
  }
  
  let vertices = polyhedron.vertices.map(v => [...v]);
  const edges = polyhedron.edges;
  
  // Center vertices at origin
  const xs = vertices.map(v => v[0]);
  const ys = vertices.map(v => v[1]);
  const zs = vertices.map(v => v[2]);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const centerZ = (Math.min(...zs) + Math.max(...zs)) / 2;
  vertices = vertices.map(v => [v[0] - centerX, v[1] - centerY, v[2] - centerZ]);
  
  // Normalize by circumradius (max distance from center) so rotation doesn't cause clipping
  const circumradius = Math.max(...vertices.map(v => Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)));
  vertices = vertices.map(v => v.map(c => c / circumradius));
  
  // Assign colors to edges - cycle through colors, then shuffle
  let edgeColors = edges.map((_, i) => EDGE_COLORS[i % EDGE_COLORS.length]);
  edgeColors = shuffleArray(edgeColors);
  
  // Create GIF encoder
  const encoder = new GIFEncoder(size, size);
  const outputPath = path.resolve(process.cwd(), output);
  
  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  const stream = fs.createWriteStream(outputPath);
  encoder.createReadStream().pipe(stream);
  
  encoder.start();
  encoder.setRepeat(0);  // 0 = loop forever
  encoder.setDelay(duration);
  encoder.setQuality(10);
  
  if (transparent) {
    encoder.setTransparent(0x000000);
  }
  
  // Generate frames
  console.log(`Generating ${frames} frames for ${shapeName}...`);
  
  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    const angleX = 0.4;  // Fixed tilt
    const angleY = t * 2 * Math.PI;  // Full rotation
    const angleZ = 0.2;  // Slight additional tilt
    
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    if (!transparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }
    
    generateFrame(ctx, vertices, edges, edgeColors, size, angleX, angleY, angleZ);
    
    encoder.addFrame(ctx);
    
    if ((i + 1) % 10 === 0) {
      console.log(`  Frame ${i + 1}/${frames}`);
    }
  }
  
  encoder.finish();
  
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log(`\nGenerated: ${outputPath}`);
      resolve({ path: outputPath, shape: shapeName });
    });
    stream.on('error', reject);
  });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--shape' && args[i + 1]) {
      options.shape = args[++i];
    } else if (arg === '--category' && args[i + 1]) {
      options.category = args[++i];
    } else if (arg === '--size' && args[i + 1]) {
      options.size = parseInt(args[++i], 10);
    } else if (arg === '--frames' && args[i + 1]) {
      options.frames = parseInt(args[++i], 10);
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--bg' && args[i + 1]) {
      options.bgColor = args[++i];
    } else if (arg === '--transparent') {
      options.transparent = true;
    } else if (arg === '--duration' && args[i + 1]) {
      options.duration = parseInt(args[++i], 10);
    } else if (arg === '--list') {
      console.log(`\nAvailable shapes (${SHAPE_NAMES.length} total):\n`);
      for (const [cat, shapes] of Object.entries(CATEGORIES)) {
        console.log(`${cat} (${shapes.length}):`);
        console.log(`  ${shapes.join(', ')}\n`);
      }
      process.exit(0);
    } else if (arg === '--help') {
      console.log(`
Usage: node scripts/generate-polyhedra.js [options]

Options:
  --shape <name>      Specific shape name (use --list to see all ${SHAPE_NAMES.length} shapes)
  --category <cat>    Random from category: platonic, archimedean, catalan, keplerPoinsot, johnson, parametric
  --list              List all available shapes by category
  --size <px>         Image size (default: 60)
  --frames <n>        Animation frames (default: 24)
  --output <path>     Output path (default: polyhedra/demo.gif)
  --bg <hex>          Background color (default: #000000)
  --transparent       Transparent background
  --duration <ms>     Frame duration in ms (default: 100)
  --help              Show this help

Examples:
  node scripts/generate-polyhedra.js                          # Random shape
  node scripts/generate-polyhedra.js --shape cube             # Specific shape
  node scripts/generate-polyhedra.js --category johnson       # Random Johnson solid
  node scripts/generate-polyhedra.js --list                   # Show all shapes
`);
      process.exit(0);
    }
  }
  
  return options;
}

// Export for module usage
module.exports = { generatePolyhedronGif, POLYHEDRA, SHAPE_NAMES, CATEGORIES, DEFAULT_OPTIONS };

// Run CLI only when executed directly (not imported)
if (require.main === module) {
  const options = parseArgs();
  generatePolyhedronGif(options).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
