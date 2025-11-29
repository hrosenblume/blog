/**
 * The 13 Archimedean Solids - semi-regular convex polyhedra.
 * These have regular polygon faces of two or more types, with identical vertices.
 */

// Golden ratio
const PHI = (1 + Math.sqrt(5)) / 2;
const PHI2 = PHI * PHI;
const PHI3 = PHI * PHI * PHI;

// Helper to generate permutations with sign changes
function permutations(coords, evenOnly = false) {
  const results = [];
  const [a, b, c] = coords;
  
  // All permutations
  const perms = [
    [a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]
  ];
  
  // Filter for even permutations if needed
  const usePerms = evenOnly ? [perms[0], perms[3], perms[4]] : perms;
  
  for (const perm of usePerms) {
    // All sign combinations
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          results.push([perm[0] * sx, perm[1] * sy, perm[2] * sz]);
        }
      }
    }
  }
  
  return results;
}

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

// Helper to find edges from vertices (connect vertices within a distance range)
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

const archimedean = {
  // Truncated Tetrahedron: 4 triangles + 4 hexagons
  truncated_tetrahedron: (() => {
    const vertices = uniqueVertices([
      ...permutations([1, 1, 3], true),
      ...permutations([-1, -1, 3], true),
      ...permutations([1, -1, -3], true),
      ...permutations([-1, 1, -3], true)
    ].flat().reduce((acc, _, i, arr) => {
      if (i % 3 === 0) acc.push([arr[i], arr[i+1], arr[i+2]]);
      return acc;
    }, []));
    // Simpler construction
    const verts = [
      [3, 1, 1], [3, -1, -1], [-3, 1, -1], [-3, -1, 1],
      [1, 3, 1], [-1, 3, -1], [1, -3, -1], [-1, -3, 1],
      [1, 1, 3], [-1, -1, 3], [1, -1, -3], [-1, 1, -3]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // Cuboctahedron: 8 triangles + 6 squares (already had this one)
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
  },

  // Truncated Cube: 8 triangles + 6 octagons
  truncated_cube: (() => {
    const r = Math.SQRT2 - 1;
      const verts = [];
    // Permutations of (±1, ±r, ±r) and cyclic
    for (const [a, b, c] of [[1, r, r], [r, 1, r], [r, r, 1]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([a * sx, b * sy, c * sz]);
          }
        }
      }
    }
    return { vertices: verts, edges: findEdgesSmart(verts) };
    })(),

  // Truncated Octahedron: 6 squares + 8 hexagons
  truncated_octahedron: (() => {
    const verts = [];
    // All permutations of (0, ±1, ±2)
    const coords = [0, 1, 2];
    for (const perm of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([perm[0] * sx, perm[1] * sy, perm[2] * sz]);
          }
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Rhombicuboctahedron: 8 triangles + 18 squares
  rhombicuboctahedron: (() => {
    const r = 1 + Math.SQRT2;
      const verts = [];
    // Permutations of (±1, ±1, ±r)
    for (const [a, b, c] of [[1, 1, r], [1, r, 1], [r, 1, 1]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([a * sx, b * sy, c * sz]);
          }
        }
      }
    }
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // Truncated Cuboctahedron (Great Rhombicuboctahedron): 12 squares + 8 hexagons + 6 octagons
  truncated_cuboctahedron: (() => {
    const r1 = 1;
    const r2 = 1 + Math.SQRT2;
    const r3 = 1 + 2 * Math.SQRT2;
      const verts = [];
    // Permutations of (±1, ±(1+√2), ±(1+2√2))
    for (const perm of [[r1, r2, r3], [r1, r3, r2], [r2, r1, r3], [r2, r3, r1], [r3, r1, r2], [r3, r2, r1]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([perm[0] * sx, perm[1] * sy, perm[2] * sz]);
          }
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
    })(),

  // Snub Cube: 32 triangles + 6 squares (chiral)
  snub_cube: (() => {
    // Tribonacci constant
    const t = 1.8392867552141612; // Real root of t^3 - t^2 - t - 1 = 0
      const verts = [];
    // Even permutations of (±1, ±1/t, ±t) with sign changes
    const coords = [1, 1/t, t];
    const evenPerms = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    for (const perm of evenPerms) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            if (sx * sy * sz === 1) { // Even parity signs
              verts.push([coords[perm[0]] * sx, coords[perm[1]] * sy, coords[perm[2]] * sz]);
            }
          }
        }
      }
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            if (sx * sy * sz === -1) { // Odd parity signs
              verts.push([coords[perm[0]] * sx, coords[perm[1]] * sy, coords[perm[2]] * sz]);
            }
          }
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Icosidodecahedron: 20 triangles + 12 pentagons
  icosidodecahedron: (() => {
    const verts = [
      // Permutations of (0, 0, ±φ)
      [0, 0, PHI], [0, 0, -PHI],
      [0, PHI, 0], [0, -PHI, 0],
      [PHI, 0, 0], [-PHI, 0, 0],
      // Permutations of (±1/2, ±φ/2, ±(1+φ)/2)
    ];
    const a = 0.5;
    const b = PHI / 2;
    const c = (1 + PHI) / 2;
    for (const perm of [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([perm[0] * sx, perm[1] * sy, perm[2] * sz]);
          }
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
    })(),

  // Truncated Dodecahedron: 20 triangles + 12 decagons
  truncated_dodecahedron: (() => {
      const verts = [];
      // (0, ±1/φ, ±(2+φ))
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([0, sy / PHI, sz * (2 + PHI)]);
        verts.push([0, sy * (2 + PHI), sz / PHI]);
        verts.push([sy / PHI, 0, sz * (2 + PHI)]);
        verts.push([sy * (2 + PHI), 0, sz / PHI]);
        verts.push([sy / PHI, sz * (2 + PHI), 0]);
        verts.push([sy * (2 + PHI), sz / PHI, 0]);
      }
      }
      // (±1/φ, ±φ, ±2φ)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy * PHI, sz * 2 * PHI]);
          verts.push([sx / PHI, sy * 2 * PHI, sz * PHI]);
          verts.push([sx * PHI, sy / PHI, sz * 2 * PHI]);
          verts.push([sx * PHI, sy * 2 * PHI, sz / PHI]);
          verts.push([sx * 2 * PHI, sy / PHI, sz * PHI]);
          verts.push([sx * 2 * PHI, sy * PHI, sz / PHI]);
        }
        }
      }
      // (±φ, ±2, ±(φ+1))
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * PHI, sy * 2, sz * (PHI + 1)]);
          verts.push([sx * PHI, sy * (PHI + 1), sz * 2]);
          verts.push([sx * 2, sy * PHI, sz * (PHI + 1)]);
          verts.push([sx * 2, sy * (PHI + 1), sz * PHI]);
          verts.push([sx * (PHI + 1), sy * PHI, sz * 2]);
          verts.push([sx * (PHI + 1), sy * 2, sz * PHI]);
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
    })(),

  // Truncated Icosahedron (soccer ball): 12 pentagons + 20 hexagons
  truncated_icosahedron: (() => {
      const verts = [];
      // (0, ±1, ±3φ)
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([0, sy, sz * 3 * PHI]);
        verts.push([0, sz * 3 * PHI, sy]);
        verts.push([sy, sz * 3 * PHI, 0]);
      }
      }
      // (±1, ±(2+φ), ±2φ)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy * (2 + PHI), sz * 2 * PHI]);
          verts.push([sx, sz * 2 * PHI, sy * (2 + PHI)]);
          verts.push([sy * (2 + PHI), sx, sz * 2 * PHI]);
          verts.push([sy * (2 + PHI), sz * 2 * PHI, sx]);
          verts.push([sz * 2 * PHI, sx, sy * (2 + PHI)]);
          verts.push([sz * 2 * PHI, sy * (2 + PHI), sx]);
        }
        }
      }
      // (±φ, ±2, ±(2φ+1))
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * PHI, sy * 2, sz * (2 * PHI + 1)]);
          verts.push([sx * PHI, sz * (2 * PHI + 1), sy * 2]);
          verts.push([sy * 2, sx * PHI, sz * (2 * PHI + 1)]);
          verts.push([sy * 2, sz * (2 * PHI + 1), sx * PHI]);
          verts.push([sz * (2 * PHI + 1), sx * PHI, sy * 2]);
          verts.push([sz * (2 * PHI + 1), sy * 2, sx * PHI]);
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
    })(),

  // Rhombicosidodecahedron: 20 triangles + 30 squares + 12 pentagons
  rhombicosidodecahedron: (() => {
      const verts = [];
      // (±1, ±1, ±φ³)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy, sz * PHI3]);
          verts.push([sx, sz * PHI3, sy]);
          verts.push([sz * PHI3, sx, sy]);
        }
        }
      }
      // (±φ², ±φ, ±2φ)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * PHI2, sy * PHI, sz * 2 * PHI]);
          verts.push([sx * PHI2, sz * 2 * PHI, sy * PHI]);
          verts.push([sy * PHI, sx * PHI2, sz * 2 * PHI]);
          verts.push([sy * PHI, sz * 2 * PHI, sx * PHI2]);
          verts.push([sz * 2 * PHI, sx * PHI2, sy * PHI]);
          verts.push([sz * 2 * PHI, sy * PHI, sx * PHI2]);
        }
        }
      }
      // (±(2+φ), 0, ±φ²)
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([sx * (2 + PHI), 0, sz * PHI2]);
        verts.push([0, sx * (2 + PHI), sz * PHI2]);
        verts.push([sz * PHI2, sx * (2 + PHI), 0]);
        verts.push([sz * PHI2, 0, sx * (2 + PHI)]);
        verts.push([0, sz * PHI2, sx * (2 + PHI)]);
        verts.push([sx * (2 + PHI), sz * PHI2, 0]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
    })(),

  // Truncated Icosidodecahedron (Great Rhombicosidodecahedron)
  truncated_icosidodecahedron: (() => {
      const verts = [];
      // (±1/φ, ±1/φ, ±(3+φ))
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy / PHI, sz * (3 + PHI)]);
          verts.push([sx / PHI, sz * (3 + PHI), sy / PHI]);
          verts.push([sz * (3 + PHI), sx / PHI, sy / PHI]);
        }
        }
      }
      // (±2/φ, ±φ, ±(1+2φ))
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * 2 / PHI, sy * PHI, sz * (1 + 2 * PHI)]);
          verts.push([sx * 2 / PHI, sz * (1 + 2 * PHI), sy * PHI]);
          verts.push([sy * PHI, sx * 2 / PHI, sz * (1 + 2 * PHI)]);
          verts.push([sy * PHI, sz * (1 + 2 * PHI), sx * 2 / PHI]);
          verts.push([sz * (1 + 2 * PHI), sx * 2 / PHI, sy * PHI]);
          verts.push([sz * (1 + 2 * PHI), sy * PHI, sx * 2 / PHI]);
        }
      }
    }
    // (±1/φ, ±φ², ±(−1+3φ))
    const v1 = -1 + 3 * PHI;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy * PHI2, sz * v1]);
          verts.push([sx / PHI, sz * v1, sy * PHI2]);
          verts.push([sy * PHI2, sx / PHI, sz * v1]);
          verts.push([sy * PHI2, sz * v1, sx / PHI]);
          verts.push([sz * v1, sx / PHI, sy * PHI2]);
          verts.push([sz * v1, sy * PHI2, sx / PHI]);
        }
      }
    }
    // (±(2φ−1), ±2, ±(2+φ))
    const v2 = 2 * PHI - 1;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * v2, sy * 2, sz * (2 + PHI)]);
          verts.push([sx * v2, sz * (2 + PHI), sy * 2]);
          verts.push([sy * 2, sx * v2, sz * (2 + PHI)]);
          verts.push([sy * 2, sz * (2 + PHI), sx * v2]);
          verts.push([sz * (2 + PHI), sx * v2, sy * 2]);
          verts.push([sz * (2 + PHI), sy * 2, sx * v2]);
          }
        }
      }
      // (±φ, ±3, ±2φ)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * PHI, sy * 3, sz * 2 * PHI]);
          verts.push([sx * PHI, sz * 2 * PHI, sy * 3]);
          verts.push([sy * 3, sx * PHI, sz * 2 * PHI]);
          verts.push([sy * 3, sz * 2 * PHI, sx * PHI]);
          verts.push([sz * 2 * PHI, sx * PHI, sy * 3]);
          verts.push([sz * 2 * PHI, sy * 3, sx * PHI]);
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
    })(),

  // Snub Dodecahedron: 80 triangles + 12 pentagons (chiral)
  snub_dodecahedron: (() => {
    // Constants for snub dodecahedron
    const xi = 1.7155615341463217; // Positive root of xi^3 - 2xi = φ
    const alpha = xi - 1 / xi;
    const beta = xi * PHI + PHI2 + PHI / xi;
    
      const verts = [];
    // Even permutations with even sign changes of (±2α, ±2, ±2β)
    const coords = [[2 * alpha, 2, 2 * beta], [2, 2 * beta, 2 * alpha], [2 * beta, 2 * alpha, 2]];
    for (const c of coords) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([c[0] * sx, c[1] * sy, c[2] * sz]);
          }
        }
      }
    }
    
    // Add more vertices with different coordinate combinations
    const a1 = alpha + beta / PHI + PHI;
    const a2 = -alpha * PHI + beta + 1 / PHI;
    const a3 = alpha / PHI + beta * PHI + -1;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * a1, sy * a2, sz * a3]);
          verts.push([sx * a2, sy * a3, sz * a1]);
          verts.push([sx * a3, sy * a1, sz * a2]);
        }
      }
    }
    
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })()
};

module.exports = archimedean;
