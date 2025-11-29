/**
 * OFF (Object File Format) Parser
 * 
 * Parses standard OFF files and outputs JSON with vertices, edges, and faces.
 * OFF format: https://en.wikipedia.org/wiki/OFF_(file_format)
 * 
 * Format:
 *   OFF
 *   numVertices numFaces numEdges
 *   x y z           (vertex coordinates, one per line)
 *   ...
 *   n v1 v2 v3 ...  (face: n = vertex count, followed by vertex indices)
 *   ...
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse an OFF file string into vertices, edges, and faces
 * @param {string} content - The OFF file content
 * @returns {{ vertices: number[][], edges: number[][], faces: number[][] }}
 */
function parseOFF(content) {
  // Remove comments and split into lines
  const lines = content
    .split('\n')
    .map(line => line.replace(/#.*$/, '').trim())
    .filter(line => line.length > 0);

  // First line should be "OFF" or start with it
  let lineIndex = 0;
  if (lines[lineIndex].toUpperCase().startsWith('OFF')) {
    // Could be "OFF" alone or "OFF numV numF numE" on same line
    const firstLine = lines[lineIndex].toUpperCase();
    if (firstLine === 'OFF') {
      lineIndex++;
    } else {
      // "OFF 8 6 12" format - strip OFF and continue
      lines[lineIndex] = lines[lineIndex].substring(3).trim();
    }
  }

  // Parse counts line
  const counts = lines[lineIndex].split(/\s+/).map(Number);
  const numVertices = counts[0];
  const numFaces = counts[1];
  // numEdges (counts[2]) is often 0 and not used
  lineIndex++;

  // Parse vertices
  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    const coords = lines[lineIndex + i].split(/\s+/).map(Number);
    vertices.push([coords[0], coords[1], coords[2]]);
  }
  lineIndex += numVertices;

  // Parse faces
  const faces = [];
  for (let i = 0; i < numFaces; i++) {
    const parts = lines[lineIndex + i].split(/\s+/).map(Number);
    const vertexCount = parts[0];
    const faceVertices = parts.slice(1, 1 + vertexCount);
    faces.push(faceVertices);
  }

  // Derive edges from faces (each edge appears in exactly 2 faces)
  const edges = edgesFromFaces(faces);

  return { vertices, edges, faces };
}

/**
 * Derive unique edges from face definitions
 * @param {number[][]} faces - Array of faces, each face is array of vertex indices
 * @returns {number[][]} - Array of edges [v1, v2] where v1 < v2
 */
function edgesFromFaces(faces) {
  const edgeSet = new Set();
  
  for (const face of faces) {
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
 * Normalize vertices: center at origin and scale to unit circumradius
 * @param {number[][]} vertices 
 * @returns {number[][]}
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
 * Parse an OFF file and return normalized shape data
 * @param {string} filePath - Path to the OFF file
 * @returns {{ name: string, vertices: number[][], edges: number[][], faces: number[][] }}
 */
function parseOFFFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { vertices, edges, faces } = parseOFF(content);
  const normalizedVertices = normalizeVertices(vertices);
  
  // Extract name from filename
  const name = path.basename(filePath, '.off')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  return {
    name,
    vertices: normalizedVertices,
    edges,
    faces
  };
}

/**
 * Round coordinates to reduce JSON size
 * @param {number[][]} vertices 
 * @param {number} decimals 
 * @returns {number[][]}
 */
function roundVertices(vertices, decimals = 6) {
  const factor = Math.pow(10, decimals);
  return vertices.map(v => v.map(c => Math.round(c * factor) / factor));
}

module.exports = {
  parseOFF,
  parseOFFFile,
  edgesFromFaces,
  normalizeVertices,
  roundVertices
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node off-parser.js <file.off> [--json]');
    process.exit(1);
  }

  const filePath = args[0];
  const jsonOutput = args.includes('--json');

  try {
    const result = parseOFFFile(filePath);
    result.vertices = roundVertices(result.vertices);
    
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Name: ${result.name}`);
      console.log(`Vertices: ${result.vertices.length}`);
      console.log(`Edges: ${result.edges.length}`);
      console.log(`Faces: ${result.faces.length}`);
    }
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err.message);
    process.exit(1);
  }
}

