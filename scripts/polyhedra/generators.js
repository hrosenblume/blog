/**
 * Parametric polyhedra generators.
 * Generate vertices and edges algorithmically for families of shapes.
 */

/**
 * Generate an n-gonal prism (two parallel n-gons connected by rectangles)
 * @param {number} n - Number of sides (3 = triangular prism, 4 = cube, etc.)
 * @returns {{ vertices: number[][], edges: number[][] }}
 */
function generatePrism(n) {
  const vertices = [];
  const edges = [];
  const angleStep = (2 * Math.PI) / n;
  const halfHeight = 0.5;

  // Bottom and top n-gon vertices
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    vertices.push([x, y, -halfHeight]); // bottom
    vertices.push([x, y, halfHeight]);  // top
  }

  // Edges
  for (let i = 0; i < n; i++) {
    const bottomIdx = i * 2;
    const topIdx = i * 2 + 1;
    const nextBottomIdx = ((i + 1) % n) * 2;
    const nextTopIdx = ((i + 1) % n) * 2 + 1;

    // Bottom polygon edge
    edges.push([bottomIdx, nextBottomIdx]);
    // Top polygon edge
    edges.push([topIdx, nextTopIdx]);
    // Vertical edge
    edges.push([bottomIdx, topIdx]);
  }

  return { vertices, edges };
}

/**
 * Generate an n-gonal antiprism (two parallel n-gons rotated and connected by triangles)
 * @param {number} n - Number of sides
 * @returns {{ vertices: number[][], edges: number[][] }}
 */
function generateAntiprism(n) {
  const vertices = [];
  const edges = [];
  const angleStep = (2 * Math.PI) / n;
  const halfHeight = 0.5;
  const twist = Math.PI / n; // Half-step rotation for top polygon

  // Bottom n-gon vertices
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    vertices.push([Math.cos(angle), Math.sin(angle), -halfHeight]);
  }

  // Top n-gon vertices (rotated by half step)
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep + twist;
    vertices.push([Math.cos(angle), Math.sin(angle), halfHeight]);
  }

  // Bottom polygon edges
  for (let i = 0; i < n; i++) {
    edges.push([i, (i + 1) % n]);
  }

  // Top polygon edges
  for (let i = 0; i < n; i++) {
    edges.push([n + i, n + ((i + 1) % n)]);
  }

  // Zigzag edges connecting top and bottom
  for (let i = 0; i < n; i++) {
    edges.push([i, n + i]);           // bottom[i] to top[i]
    edges.push([i, n + ((i + n - 1) % n)]); // bottom[i] to top[i-1]
  }

  return { vertices, edges };
}

/**
 * Generate an n-gonal pyramid (n-gon base with apex)
 * @param {number} n - Number of sides
 * @returns {{ vertices: number[][], edges: number[][] }}
 */
function generatePyramid(n) {
  const vertices = [];
  const edges = [];
  const angleStep = (2 * Math.PI) / n;
  
  // Calculate height for a "nice" pyramid (equilateral-ish triangular faces)
  const baseRadius = 1;
  const height = baseRadius * Math.sqrt(2 - 2 * Math.cos(angleStep));

  // Base vertices
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    vertices.push([Math.cos(angle) * baseRadius, Math.sin(angle) * baseRadius, 0]);
  }

  // Apex
  vertices.push([0, 0, height]);
  const apexIdx = n;

  // Base edges
  for (let i = 0; i < n; i++) {
    edges.push([i, (i + 1) % n]);
  }

  // Lateral edges (base to apex)
  for (let i = 0; i < n; i++) {
    edges.push([i, apexIdx]);
  }

  return { vertices, edges };
}

/**
 * Generate an n-gonal bipyramid (two pyramids base-to-base)
 * @param {number} n - Number of sides
 * @returns {{ vertices: number[][], edges: number[][] }}
 */
function generateBipyramid(n) {
  const vertices = [];
  const edges = [];
  const angleStep = (2 * Math.PI) / n;
  
  // Height calculation for nice proportions
  const baseRadius = 1;
  const height = baseRadius * Math.sqrt(2 - 2 * Math.cos(angleStep));

  // Equatorial vertices (the n-gon in the middle)
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    vertices.push([Math.cos(angle) * baseRadius, Math.sin(angle) * baseRadius, 0]);
  }

  // Top apex
  vertices.push([0, 0, height]);
  const topApexIdx = n;

  // Bottom apex
  vertices.push([0, 0, -height]);
  const bottomApexIdx = n + 1;

  // Equatorial edges
  for (let i = 0; i < n; i++) {
    edges.push([i, (i + 1) % n]);
  }

  // Edges to top apex
  for (let i = 0; i < n; i++) {
    edges.push([i, topApexIdx]);
  }

  // Edges to bottom apex
  for (let i = 0; i < n; i++) {
    edges.push([i, bottomApexIdx]);
  }

  return { vertices, edges };
}

/**
 * Generate an n-gonal trapezohedron (dual of antiprism)
 * @param {number} n - Number of sides (faces are 2n kite-shaped)
 * @returns {{ vertices: number[][], edges: number[][] }}
 */
function generateTrapezohedron(n) {
  const vertices = [];
  const edges = [];
  const angleStep = (2 * Math.PI) / n;
  const twist = Math.PI / n;

  // Middle ring - two interleaved n-gons at different heights
  const midRadius = 1;
  const midHeight = 0.3;

  // First ring (at height +midHeight)
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    vertices.push([Math.cos(angle) * midRadius, Math.sin(angle) * midRadius, midHeight]);
  }

  // Second ring (at height -midHeight, rotated)
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep + twist;
    vertices.push([Math.cos(angle) * midRadius, Math.sin(angle) * midRadius, -midHeight]);
  }

  // Top apex
  const apexHeight = 1.2;
  vertices.push([0, 0, apexHeight]);
  const topApexIdx = 2 * n;

  // Bottom apex
  vertices.push([0, 0, -apexHeight]);
  const bottomApexIdx = 2 * n + 1;

  // Edges forming the kite faces
  // Each kite connects: top apex, ring1[i], ring2[i], ring1[i+1]
  // and: bottom apex, ring2[i], ring1[i+1], ring2[i+1]
  for (let i = 0; i < n; i++) {
    const r1i = i;
    const r1next = (i + 1) % n;
    const r2i = n + i;
    const r2next = n + ((i + 1) % n);

    // Zigzag edges between rings
    edges.push([r1i, r2i]);
    edges.push([r2i, r1next]);

    // Edges to top apex
    edges.push([topApexIdx, r1i]);

    // Edges to bottom apex
    edges.push([bottomApexIdx, r2i]);
  }

  return { vertices, edges };
}

/**
 * Generate all parametric polyhedra for a given range
 * @param {number} minN - Minimum number of sides (default 3)
 * @param {number} maxN - Maximum number of sides (default 12)
 * @returns {Object} Object with all generated polyhedra
 */
function generateAllParametric(minN = 3, maxN = 12) {
  const polyhedra = {};

  const names = {
    3: 'triangular',
    4: 'square',
    5: 'pentagonal',
    6: 'hexagonal',
    7: 'heptagonal',
    8: 'octagonal',
    9: 'nonagonal',
    10: 'decagonal',
    11: 'hendecagonal',
    12: 'dodecagonal'
  };

  for (let n = minN; n <= maxN; n++) {
    const prefix = names[n] || `${n}-gonal`;

    // Skip square prism (it's just a cube) - but keep it for completeness with different name
    polyhedra[`${prefix}_prism`] = generatePrism(n);
    polyhedra[`${prefix}_antiprism`] = generateAntiprism(n);
    polyhedra[`${prefix}_pyramid`] = generatePyramid(n);
    polyhedra[`${prefix}_bipyramid`] = generateBipyramid(n);
    
    // Trapezohedra need n >= 3
    if (n >= 3 && n <= 10) {
      polyhedra[`${prefix}_trapezohedron`] = generateTrapezohedron(n);
    }
  }

  return polyhedra;
}

module.exports = {
  generatePrism,
  generateAntiprism,
  generatePyramid,
  generateBipyramid,
  generateTrapezohedron,
  generateAllParametric
};
