/**
 * Generate animated rotating 3D polyhedra GIFs with cylindrical edges.
 * Port of the Python generator to Node.js using canvas.
 * 
 * Usage: node scripts/generate-polyhedra.js [options]
 *   --shape <name>    Specific shape (tetrahedron, cube, octahedron, icosahedron, dodecahedron, cuboctahedron)
 *   --size <px>       Image size in pixels (default: 300)
 *   --frames <n>      Number of animation frames (default: 36)
 *   --output <path>   Output file path (default: polyhedra/demo.gif)
 *   --transparent     Use transparent background
 *   --bg <color>      Background color hex (default: #000000)
 */

const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

// Golden ratio for icosahedron/dodecahedron
const PHI = (1 + Math.sqrt(5)) / 2;

// Polyhedra vertex coordinates
const POLYHEDRA = {
  tetrahedron: {
    vertices: [
      [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
    ]
  },
  cube: {
    vertices: [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]
  },
  octahedron: {
    vertices: [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
    ],
    edges: [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [2, 5], [3, 4], [3, 5]
    ]
  },
  icosahedron: {
    vertices: [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ],
    edges: [
      [0, 1], [0, 4], [0, 5], [0, 8], [0, 9],
      [1, 6], [1, 7], [1, 8], [1, 9],
      [2, 3], [2, 4], [2, 5], [2, 10], [2, 11],
      [3, 6], [3, 7], [3, 10], [3, 11],
      [4, 5], [4, 8], [4, 10],
      [5, 9], [5, 11],
      [6, 7], [6, 8], [6, 10],
      [7, 9], [7, 11],
      [8, 10], [9, 11]
    ]
  },
  dodecahedron: {
    vertices: [
      // Cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Rectangle vertices (3 rectangles)
      [0, PHI, 1/PHI], [0, PHI, -1/PHI], [0, -PHI, 1/PHI], [0, -PHI, -1/PHI],
      [1/PHI, 0, PHI], [-1/PHI, 0, PHI], [1/PHI, 0, -PHI], [-1/PHI, 0, -PHI],
      [PHI, 1/PHI, 0], [PHI, -1/PHI, 0], [-PHI, 1/PHI, 0], [-PHI, -1/PHI, 0]
    ],
    edges: [
      [0, 8], [0, 12], [0, 16],
      [1, 9], [1, 14], [1, 16],
      [2, 10], [2, 12], [2, 17],
      [3, 11], [3, 14], [3, 17],
      [4, 8], [4, 13], [4, 18],
      [5, 9], [5, 15], [5, 18],
      [6, 10], [6, 13], [6, 19],
      [7, 11], [7, 15], [7, 19],
      [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19]
    ]
  },
  cuboctahedron: {
    vertices: [
      [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
      [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
      [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]
    ],
    edges: [
      [0, 4], [0, 5], [0, 8], [0, 9],
      [1, 4], [1, 5], [1, 10], [1, 11],
      [2, 6], [2, 7], [2, 8], [2, 9],
      [3, 6], [3, 7], [3, 10], [3, 11],
      [4, 8], [4, 10], [5, 9], [5, 11],
      [6, 8], [6, 10], [7, 9], [7, 11]
    ]
  }
};

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

async function generatePolyhedronGif(options = {}) {
  const {
    shape = null,
    size = 300,
    frames = 36,
    bgColor = '#000000',
    transparent = false,
    duration = 80,
    output = 'polyhedra/demo.gif'
  } = options;
  
  // Pick random shape if not specified
  const shapes = Object.keys(POLYHEDRA);
  const shapeName = shape || shapes[Math.floor(Math.random() * shapes.length)];
  
  const polyhedron = POLYHEDRA[shapeName];
  if (!polyhedron) {
    throw new Error(`Unknown shape: ${shapeName}. Available: ${shapes.join(', ')}`);
  }
  
  let vertices = polyhedron.vertices.map(v => [...v]);
  const edges = polyhedron.edges;
  
  // Normalize vertices to unit sphere
  const maxDist = Math.max(...vertices.map(v => Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)));
  vertices = vertices.map(v => v.map(c => c / maxDist));
  
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
    } else if (arg === '--help') {
      console.log(`
Usage: node scripts/generate-polyhedra.js [options]

Options:
  --shape <name>    Shape: tetrahedron, cube, octahedron, icosahedron, dodecahedron, cuboctahedron
  --size <px>       Image size (default: 300)
  --frames <n>      Animation frames (default: 36)
  --output <path>   Output path (default: polyhedra/demo.gif)
  --bg <hex>        Background color (default: #000000)
  --transparent     Transparent background
  --duration <ms>   Frame duration in ms (default: 80)
  --help            Show this help
`);
      process.exit(0);
    }
  }
  
  return options;
}

// Run
const options = parseArgs();
generatePolyhedronGif(options).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});


