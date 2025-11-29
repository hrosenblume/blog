/**
 * Build Shapes JSON
 * 
 * Combines all polyhedra data from data/ directory, derives edges from faces,
 * normalizes vertices, and outputs to lib/polyhedra/shapes.json
 */

const fs = require('fs');
const path = require('path');

// Import all polyhedra data
const platonic = require('./data/platonic');
const archimedean = require('./data/archimedean');
const catalan = require('./data/catalan');
const keplerPoinsot = require('./data/kepler-poinsot');
const johnson = require('./data/johnson');
const { generateAllParametric } = require('./data/parametric');

/**
 * Derive edges from face definitions (guaranteed correct)
 */
function edgesFromFaces(faces) {
  const edgeSet = new Set();
  
  for (const face of faces) {
    if (!face || face.length < 3) continue;
    const n = face.length;
    for (let i = 0; i < n; i++) {
      const a = face[i];
      const b = face[(i + 1) % n];
      // Normalize edge direction for deduplication
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      edgeSet.add(key);
    }
  }

  return Array.from(edgeSet).map(key => key.split(',').map(Number));
}

/**
 * Find edges by connecting nearby vertices (fallback for shapes without faces)
 * Uses a smarter algorithm that tries multiple thresholds to ensure connectivity
 */
function findEdgesByDistance(vertices) {
  // Find all unique distances
  const distances = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const d = distance(vertices[i], vertices[j]);
      if (d > 0.001) {
        distances.push({ i, j, d });
      }
    }
  }
  distances.sort((a, b) => a.d - b.d);

  // Find shortest edge length
  const minDist = distances[0]?.d || 1;

  // Try increasing thresholds until we get good connectivity
  for (let mult = 1.1; mult <= 2.0; mult += 0.1) {
    const threshold = minDist * mult;
    const edges = distances.filter(e => e.d <= threshold).map(e => [e.i, e.j]);
    
    if (edges.length === 0) continue;

    // Check connectivity
    const adj = Array.from({ length: vertices.length }, () => []);
    for (const [a, b] of edges) {
      adj[a].push(b);
      adj[b].push(a);
    }
    
    const visited = new Set([0]);
    const queue = [0];
    while (queue.length > 0) {
      const v = queue.shift();
      for (const neighbor of adj[v]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // Check if all vertices connected and reasonable edge count
    const connected = visited.size === vertices.length;
    const ratio = edges.length / vertices.length;
    const minEdgeCount = Math.min(...adj.map(a => a.length));

    if (connected && minEdgeCount >= 3 && ratio >= 1.5 && ratio <= 3.0) {
      return edges;
    }

    // If connected but too few edges, continue to wider threshold
    if (connected && minEdgeCount < 3) continue;

    // If too many edges, back off
    if (ratio > 3.0) {
      const prevThreshold = minDist * (mult - 0.1);
      return distances.filter(e => e.d <= prevThreshold).map(e => [e.i, e.j]);
    }
  }

  // Fallback: just use 1.5x minimum distance
  return distances.filter(e => e.d <= minDist * 1.5).map(e => [e.i, e.j]);
}

function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/**
 * Normalize vertices: center at origin and scale to unit circumradius
 */
function normalizeVertices(vertices) {
  if (vertices.length === 0) return vertices;

  // Find bounding box center
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const [x, y, z] of vertices) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // Center vertices
  const centered = vertices.map(([x, y, z]) => [
    x - centerX,
    y - centerY,
    z - centerZ
  ]);

  // Find circumradius (max distance from origin)
  let maxRadius = 0;
  for (const [x, y, z] of centered) {
    const r = Math.sqrt(x * x + y * y + z * z);
    maxRadius = Math.max(maxRadius, r);
  }

  // Scale to unit circumradius
  if (maxRadius > 0) {
    return centered.map(([x, y, z]) => [
      x / maxRadius,
      y / maxRadius,
      z / maxRadius
    ]);
  }

  return centered;
}

/**
 * Round coordinates to reduce JSON size
 */
function roundVertices(vertices, decimals = 6) {
  const factor = Math.pow(10, decimals);
  return vertices.map(v => v.map(c => Math.round(c * factor) / factor));
}

/**
 * Validate shape connectivity
 */
function isConnected(vertices, edges) {
  if (vertices.length === 0) return false;
  
  const adj = Array.from({ length: vertices.length }, () => []);
  for (const [a, b] of edges) {
    if (a >= 0 && a < vertices.length && b >= 0 && b < vertices.length) {
      adj[a].push(b);
      adj[b].push(a);
    }
  }
  
  const visited = new Set([0]);
  const queue = [0];
  
  while (queue.length > 0) {
    const v = queue.shift();
    for (const neighbor of adj[v]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return visited.size === vertices.length;
}

/**
 * Count edges per vertex
 */
function getMinEdgesPerVertex(vertices, edges) {
  const counts = new Array(vertices.length).fill(0);
  for (const [a, b] of edges) {
    if (a >= 0 && a < vertices.length) counts[a]++;
    if (b >= 0 && b < vertices.length) counts[b]++;
  }
  return Math.min(...counts);
}

/**
 * Process a single shape
 */
function processShape(name, shape) {
  if (!shape || !shape.vertices || shape.vertices.length === 0) {
    return null;
  }

  // Check for invalid coordinates (NaN, null, undefined, Infinity)
  const hasInvalidCoords = shape.vertices.some(v => 
    v.some(c => c === null || c === undefined || Number.isNaN(c) || !Number.isFinite(c))
  );
  if (hasInvalidCoords) {
    console.warn(`  [SKIP] ${name}: invalid vertex coordinates (NaN/null/Infinity)`);
    return null;
  }

  // Use explicit edges if provided, otherwise derive from faces or use distance detection
  let edges;
  if (shape.edges && shape.edges.length > 0) {
    edges = shape.edges;
  } else if (shape.faces && shape.faces.length > 0) {
    edges = edgesFromFaces(shape.faces);
  } else {
    edges = findEdgesByDistance(shape.vertices);
  }

  // Validate
  if (edges.length === 0) {
    console.warn(`  [SKIP] ${name}: no edges`);
    return null;
  }

  const normalized = normalizeVertices(shape.vertices);
  const rounded = roundVertices(normalized, 5);

  // Validate connectivity
  if (!isConnected(rounded, edges)) {
    console.warn(`  [SKIP] ${name}: not connected`);
    return null;
  }

  // Validate minimum edges per vertex
  const minEdges = getMinEdgesPerVertex(rounded, edges);
  if (minEdges < 3) {
    console.warn(`  [SKIP] ${name}: vertex with only ${minEdges} edges`);
    return null;
  }

  // Check edge/vertex ratio (good polyhedra have 1.5-2.8)
  const ratio = edges.length / rounded.length;
  if (ratio > 3.5 || ratio < 1.0) {
    console.warn(`  [SKIP] ${name}: bad e/v ratio ${ratio.toFixed(2)}`);
    return null;
  }

  return {
    vertices: rounded,
    edges
  };
}

// Main build
console.log('Building polyhedra shapes...\n');

const allShapes = {
  ...platonic,
  ...archimedean,
  ...catalan,
  ...keplerPoinsot,
  ...johnson,
  ...generateAllParametric()
};

const output = {};
let validCount = 0;
let skipCount = 0;

const categories = {
  platonic: Object.keys(platonic),
  archimedean: Object.keys(archimedean),
  catalan: Object.keys(catalan),
  keplerPoinsot: Object.keys(keplerPoinsot),
  johnson: Object.keys(johnson),
  parametric: Object.keys(generateAllParametric())
};

for (const [category, names] of Object.entries(categories)) {
  console.log(`Processing ${category}...`);
  
  for (const name of names) {
    const shape = allShapes[name];
    const processed = processShape(name, shape);
    
    if (processed) {
      output[name] = processed;
      validCount++;
    } else {
      skipCount++;
    }
  }
}

console.log(`\nTotal: ${validCount} valid, ${skipCount} skipped`);

// Write output
const outputPath = path.join(__dirname, '../../lib/polyhedra/shapes.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 0));

console.log(`\nWrote ${Object.keys(output).length} shapes to ${outputPath}`);

// Optionally write debug version
if (process.argv.includes('--debug')) {
  const debugPath = path.join(__dirname, 'shapes-debug.json');
  fs.writeFileSync(debugPath, JSON.stringify(output, null, 2));
  console.log(`Wrote debug version to ${debugPath}`);
}

