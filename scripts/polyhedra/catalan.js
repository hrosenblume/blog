/**
 * The 13 Catalan Solids - duals of the Archimedean solids.
 * These have identical faces (congruent but not regular) and different vertex types.
 */

// Golden ratio
const PHI = (1 + Math.sqrt(5)) / 2;
const PHI2 = PHI * PHI;

// Helper to remove duplicate vertices (within tolerance)
function uniqueVertices(vertices, tolerance = 1e-10) {
  const unique = [];
  for (const v of vertices) {
    let isDuplicate = false;
    for (const u of unique) {
      const dist = Math.sqrt((v[0]-u[0])**2 + (v[1]-u[1])**2 + (v[2]-u[2])**2);
      if (dist < tolerance) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) unique.push(v);
  }
  return unique;
}

// Helper to find edges from vertices
function findEdges(vertices, minDist, maxDist) {
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const dist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);
      if (dist >= minDist && dist <= maxDist) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

// Helper to find shortest edge length
function findShortestEdge(vertices) {
  let minDist = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const dist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);
      if (dist > 0.01 && dist < minDist) {
        minDist = dist;
      }
    }
  }
  return minDist;
}

// Find all distinct edge lengths in a set of vertices
function findEdgeLengthClusters(vertices, tolerance = 0.15) {
  const distances = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const v1 = vertices[i];
      const v2 = vertices[j];
      const dist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);
      if (dist > 0.01) distances.push(dist);
    }
  }
  distances.sort((a, b) => a - b);
  
  const clusters = [];
  let currentCluster = [distances[0]];
  
  for (let i = 1; i < distances.length; i++) {
    const avgCluster = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
    if (distances[i] - avgCluster < tolerance * avgCluster) {
      currentCluster.push(distances[i]);
    } else {
      if (currentCluster.length >= 3) {
        clusters.push({
          min: Math.min(...currentCluster) * 0.95,
          max: Math.max(...currentCluster) * 1.05,
          count: currentCluster.length
        });
      }
      currentCluster = [distances[i]];
    }
  }
  if (currentCluster.length >= 3) {
    clusters.push({
      min: Math.min(...currentCluster) * 0.95,
      max: Math.max(...currentCluster) * 1.05,
      count: currentCluster.length
    });
  }
  
  return clusters;
}

// Check if all vertices have at least minEdges connections
function checkConnectivity(vertices, edges, minEdges = 2) {
  const vertexEdgeCount = new Array(vertices.length).fill(0);
  for (const [a, b] of edges) {
    if (a >= 0 && a < vertices.length) vertexEdgeCount[a]++;
    if (b >= 0 && b < vertices.length) vertexEdgeCount[b]++;
  }
  return vertexEdgeCount.filter(c => c < minEdges).length;
}

// Smart edge finder - ensures all vertices are connected
function findEdgesSmart(vertices) {
  const clusters = findEdgeLengthClusters(vertices);
  if (clusters.length === 0) {
    const shortest = findShortestEdge(vertices);
    return findEdges(vertices, shortest * 0.8, shortest * 2.5);
  }
  
  // Start with shortest edge cluster
  let edges = findEdges(vertices, clusters[0].min, clusters[0].max);
  
  // Keep adding clusters until all vertices have at least 2 edges
  for (let i = 1; i < clusters.length; i++) {
    if (checkConnectivity(vertices, edges) === 0) break;
    const moreEdges = findEdges(vertices, clusters[i].min, clusters[i].max);
    const edgeSet = new Set(edges.map(e => e.join(',')));
    for (const edge of moreEdges) {
      if (!edgeSet.has(edge.join(',')) && !edgeSet.has([edge[1], edge[0]].join(','))) {
        edges.push(edge);
        edgeSet.add(edge.join(','));
      }
    }
  }
  
  // If still poorly connected, progressively widen the search
  if (checkConnectivity(vertices, edges) > 0) {
    const shortest = findShortestEdge(vertices);
    for (let mult = 2.0; mult <= 4.0; mult += 0.5) {
      edges = findEdges(vertices, shortest * 0.8, shortest * mult);
      if (checkConnectivity(vertices, edges) === 0) break;
    }
  }
  
  return edges;
}

const catalan = {
  // Triakis Tetrahedron: dual of truncated tetrahedron (12 isosceles triangles)
  triakis_tetrahedron: (() => {
    const a = 5/3;
    const verts = [
      // Inner tetrahedron
      [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1],
      // Outer vertices (raised face centers)
      [a, a, a], [a, -a, -a], [-a, a, -a], [-a, -a, a]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // Rhombic Dodecahedron: dual of cuboctahedron (12 rhombic faces)
  rhombic_dodecahedron: (() => {
    const verts = [
      // Cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Octahedron vertices (scaled)
      [2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0], [0, 0, 2], [0, 0, -2]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // Triakis Octahedron: dual of truncated cube (24 isosceles triangles)
  triakis_octahedron: (() => {
    const a = 1 + Math.SQRT2;
    const verts = [
      // Octahedron vertices (inner)
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
      // Raised vertices
      [a, 0, 0], [-a, 0, 0], [0, a, 0], [0, -a, 0], [0, 0, a], [0, 0, -a]
    ];
    // This needs different edge finding - connect based on face structure
    const edges = [
      // Original octahedron edges to inner vertices
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [2, 5], [3, 4], [3, 5],
      // Edges to raised vertices
      [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
      [6, 2], [6, 3], [6, 4], [6, 5],
      [7, 2], [7, 3], [7, 4], [7, 5],
      [8, 0], [8, 1], [8, 4], [8, 5],
      [9, 0], [9, 1], [9, 4], [9, 5],
      [10, 0], [10, 1], [10, 2], [10, 3],
      [11, 0], [11, 1], [11, 2], [11, 3]
    ];
    return { vertices: verts, edges };
  })(),

  // Tetrakis Hexahedron: dual of truncated octahedron (24 isosceles triangles)
  tetrakis_hexahedron: (() => {
    const a = 3/2;
    const verts = [
      // Cube vertices (inner)
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Raised face centers (octahedron vertices)
      [a, 0, 0], [-a, 0, 0], [0, a, 0], [0, -a, 0], [0, 0, a], [0, 0, -a]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // Deltoidal Icositetrahedron: dual of rhombicuboctahedron (24 kite faces)
  deltoidal_icositetrahedron: (() => {
    const a = 1;
    const b = 1 + 1 / Math.SQRT2;
    const c = 1 + Math.SQRT2;
    const verts = [
      // Cube vertices
      [a, a, a], [a, a, -a], [a, -a, a], [a, -a, -a],
      [-a, a, a], [-a, a, -a], [-a, -a, a], [-a, -a, -a],
      // Edge midpoint vertices (scaled)
      [b, b, 0], [b, -b, 0], [-b, b, 0], [-b, -b, 0],
      [b, 0, b], [b, 0, -b], [-b, 0, b], [-b, 0, -b],
      [0, b, b], [0, b, -b], [0, -b, b], [0, -b, -b],
      // Octahedron vertices
      [c, 0, 0], [-c, 0, 0], [0, c, 0], [0, -c, 0], [0, 0, c], [0, 0, -c]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // Disdyakis Dodecahedron: dual of truncated cuboctahedron (48 scalene triangles)
  disdyakis_dodecahedron: (() => {
    const a = 1;
    const b = 1 + 1 / Math.SQRT2;
    const c = 1 + Math.SQRT2;
    const d = 2 + Math.SQRT2;
    const verts = [
      // Vertices at different radii
      [a, a, a], [a, a, -a], [a, -a, a], [a, -a, -a],
      [-a, a, a], [-a, a, -a], [-a, -a, a], [-a, -a, -a],
      [c, 0, 0], [-c, 0, 0], [0, c, 0], [0, -c, 0], [0, 0, c], [0, 0, -c],
      [b, b, 0], [b, -b, 0], [-b, b, 0], [-b, -b, 0],
      [b, 0, b], [b, 0, -b], [-b, 0, b], [-b, 0, -b],
      [0, b, b], [0, b, -b], [0, -b, b], [0, -b, -b],
      [d, 0, 0], [-d, 0, 0], [0, d, 0], [0, -d, 0], [0, 0, d], [0, 0, -d]
    ];
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Pentagonal Icositetrahedron: dual of snub cube (24 irregular pentagons)
  pentagonal_icositetrahedron: (() => {
    const t = 1.8392867552141612; // Tribonacci constant
    const a = 1;
    const b = 1 / (t * t);
    const c = t;
    const d = t * t;
    const verts = [];
    // Generate vertices through coordinate permutations
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * a, sy * a, sz * d]);
          verts.push([sx * a, sy * d, sz * a]);
          verts.push([sx * d, sy * a, sz * a]);
          verts.push([sx * b, sy * c, sz * c]);
          verts.push([sx * c, sy * b, sz * c]);
          verts.push([sx * c, sy * c, sz * b]);
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Rhombic Triacontahedron: dual of icosidodecahedron (30 rhombic faces)
  rhombic_triacontahedron: (() => {
    const verts = [];
    // Icosahedron vertices
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx, sy * PHI]);
        verts.push([sx, sy * PHI, 0]);
        verts.push([sy * PHI, 0, sx]);
      }
    }
    // Dodecahedron vertices (scaled to match)
    const d = PHI2;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * d / PHI, sy * d / PHI, sz * d / PHI]);
        }
      }
    }
    // Additional vertices
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * d / PHI2, sy * d]);
        verts.push([sx * d / PHI2, sy * d, 0]);
        verts.push([sy * d, 0, sx * d / PHI2]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Triakis Icosahedron: dual of truncated dodecahedron (60 isosceles triangles)
  triakis_icosahedron: (() => {
    const a = (7 + PHI) / 11;
    const b = PHI;
    const verts = [];
    // Icosahedron vertices
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * a, sy * a * PHI]);
        verts.push([sx * a, sy * a * PHI, 0]);
        verts.push([sy * a * PHI, 0, sx * a]);
      }
    }
    // Raised vertices (triakis points)
    const r = 1.5;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * r, sy * r * PHI]);
        verts.push([sx * r, sy * r * PHI, 0]);
        verts.push([sy * r * PHI, 0, sx * r]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Pentakis Dodecahedron: dual of truncated icosahedron (60 isosceles triangles)
  pentakis_dodecahedron: (() => {
    const verts = [];
    // Dodecahedron vertices (inner)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy, sz]);
        }
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx / PHI, sy * PHI]);
        verts.push([sx / PHI, sy * PHI, 0]);
        verts.push([sy * PHI, 0, sx / PHI]);
      }
    }
    // Raised pentagonal face centers
    const r = 1.6;
    const icosa = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ];
    for (const v of icosa) {
      const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      verts.push([v[0] * r / len, v[1] * r / len, v[2] * r / len]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Deltoidal Hexecontahedron: dual of rhombicosidodecahedron (60 kite faces)
  deltoidal_hexecontahedron: (() => {
    const verts = [];
    // Multiple shells of vertices
    const a = 1;
    const b = PHI;
    const c = PHI2;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * a, sy * a, sz * c]);
          verts.push([sx * a, sy * c, sz * a]);
          verts.push([sx * c, sy * a, sz * a]);
        }
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * b, sy * c]);
        verts.push([sx * b, sy * c, 0]);
        verts.push([sy * c, 0, sx * b]);
      }
    }
    // Icosahedron type vertices
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * a, sy * b * c]);
        verts.push([sx * a, sy * b * c, 0]);
        verts.push([sy * b * c, 0, sx * a]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Disdyakis Triacontahedron: dual of truncated icosidodecahedron (120 scalene triangles)
  disdyakis_triacontahedron: (() => {
    const verts = [];
    const a = 1;
    const b = PHI;
    const c = PHI + 1;
    const d = 2 * PHI;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * a, sy * a, sz * d]);
          verts.push([sx * a, sy * d, sz * a]);
          verts.push([sx * d, sy * a, sz * a]);
          verts.push([sx * a, sy * b, sz * c]);
          verts.push([sx * b, sy * c, sz * a]);
          verts.push([sx * c, sy * a, sz * b]);
        }
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * b, sy * d]);
        verts.push([sx * b, sy * d, 0]);
        verts.push([sy * d, 0, sx * b]);
      }
    }
    // Dodecahedron vertices
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx / PHI, sy * b * b]);
        verts.push([sx / PHI, sy * b * b, 0]);
        verts.push([sy * b * b, 0, sx / PHI]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Pentagonal Hexecontahedron: dual of snub dodecahedron (60 irregular pentagons)
  pentagonal_hexecontahedron: (() => {
    const verts = [];
    const xi = 1.7155615341463217;
    const a = PHI * xi;
    const b = PHI + xi / PHI;
    const c = xi;
    
    // Generate vertices
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * a, sy * b, sz * c]);
          verts.push([sx * b, sy * c, sz * a]);
          verts.push([sx * c, sy * a, sz * b]);
        }
      }
    }
    // Additional coordinate variations
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * c * PHI, sy * a]);
        verts.push([sx * c * PHI, sy * a, 0]);
        verts.push([sy * a, 0, sx * c * PHI]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })()
};

module.exports = catalan;

