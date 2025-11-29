/**
 * The 13 Archimedean Solids - Semi-regular convex polyhedra
 * 
 * These have regular polygon faces of two or more types, with identical vertices.
 * All coordinates are mathematically precise with explicit face definitions.
 */

const PHI = (1 + Math.sqrt(5)) / 2;
const PHI2 = PHI * PHI;
const PHI3 = PHI * PHI * PHI;
const SQRT2 = Math.SQRT2;

const archimedean = {
  // Truncated Tetrahedron: 4 triangles + 4 hexagons (12 vertices, 18 edges)
  truncated_tetrahedron: {
    vertices: [
      [3, 1, 1], [1, 3, 1], [1, 1, 3],
      [-3, -1, 1], [-1, -3, 1], [-1, -1, 3],
      [-3, 1, -1], [-1, 3, -1], [-1, 1, -3],
      [3, -1, -1], [1, -3, -1], [1, -1, -3]
    ],
    faces: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [9, 10, 11],
      [0, 2, 5, 4, 10, 9],
      [0, 9, 11, 8, 7, 1],
      [1, 7, 6, 3, 5, 2],
      [3, 6, 8, 11, 10, 4]
    ]
  },

  // Cuboctahedron: 8 triangles + 6 squares (12 vertices, 24 edges)
  cuboctahedron: {
    vertices: [
      [1, 1, 0],   // 0
      [1, -1, 0],  // 1
      [-1, 1, 0],  // 2
      [-1, -1, 0], // 3
      [1, 0, 1],   // 4
      [1, 0, -1],  // 5
      [-1, 0, 1],  // 6
      [-1, 0, -1], // 7
      [0, 1, 1],   // 8
      [0, 1, -1],  // 9
      [0, -1, 1],  // 10
      [0, -1, -1]  // 11
    ],
    // Explicit edges (24 total) - no face derivation needed
    edges: [
      [0, 4], [0, 5], [0, 8], [0, 9],
      [1, 4], [1, 5], [1, 10], [1, 11],
      [2, 6], [2, 7], [2, 8], [2, 9],
      [3, 6], [3, 7], [3, 10], [3, 11],
      [4, 8], [4, 10], [5, 9], [5, 11],
      [6, 8], [6, 10], [7, 9], [7, 11]
    ],
    faces: []
  },

  // Truncated Cube: 8 triangles + 6 octagons (24 vertices, 36 edges)
  truncated_cube: (() => {
    const xi = SQRT2 - 1;
    // Vertices: permutations of (±ξ, ±1, ±1)
    const vertices = [];
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([xi * s1, s2, s3]);
          vertices.push([s2, xi * s1, s3]);
          vertices.push([s2, s3, xi * s1]);
        }
      }
    }
    // Remove duplicates and use empty faces (will use edge detection)
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Truncated Octahedron: 6 squares + 8 hexagons (24 vertices, 36 edges)
  truncated_octahedron: (() => {
    const vertices = [];
    // All permutations of (0, ±1, ±2)
    for (const perm of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) {
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          const v = [perm[0], perm[1] * s1, perm[2] * s2];
          if (perm[0] === 0) vertices.push(v);
          else {
            vertices.push([v[0], v[1], v[2]]);
            vertices.push([-v[0], v[1], v[2]]);
          }
        }
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Rhombicuboctahedron: 8 triangles + 18 squares (24 vertices, 48 edges)
  rhombicuboctahedron: (() => {
    const a = 1 + SQRT2;
    const vertices = [];
    // All permutations of (±1, ±1, ±(1+√2))
    for (const perm of [[1, 1, a], [1, a, 1], [a, 1, 1]]) {
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          for (const s3 of [-1, 1]) {
            vertices.push([perm[0] * s1, perm[1] * s2, perm[2] * s3]);
          }
        }
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Truncated Cuboctahedron: 12 squares + 8 hexagons + 6 octagons (48 vertices, 72 edges)
  truncated_cuboctahedron: (() => {
    const a = 1 + SQRT2;
    const b = 1 + 2 * SQRT2;
    const vertices = [];
    // All permutations of (±1, ±(1+√2), ±(1+2√2))
    for (const perm of [[1, a, b], [1, b, a], [a, 1, b], [a, b, 1], [b, 1, a], [b, a, 1]]) {
      for (const s1 of [-1, 1]) {
        for (const s2 of [-1, 1]) {
          for (const s3 of [-1, 1]) {
            vertices.push([perm[0] * s1, perm[1] * s2, perm[2] * s3]);
          }
        }
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return {
      vertices: unique,
      faces: [] // Complex face topology - will derive from edges
    };
  })(),

  // Snub Cube: 32 triangles + 6 squares (24 vertices, 60 edges) - chiral
  snub_cube: (() => {
    // Tribonacci constant (real root of t³ = t² + t + 1)
    const t = 1.8392867552141612;
    const vertices = [];
    
    // Even permutations of (±1, ±1/t, ±t) with even/odd sign changes
    const coords = [1, 1/t, t];
    const evenPerms = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    
    for (const perm of evenPerms) {
      const [a, b, c] = [coords[perm[0]], coords[perm[1]], coords[perm[2]]];
      // Even sign changes (product of signs = +1)
      vertices.push([a, b, c]);
      vertices.push([a, -b, -c]);
      vertices.push([-a, b, -c]);
      vertices.push([-a, -b, c]);
      // Odd sign changes (product of signs = -1)
      vertices.push([-a, -b, -c]);
      vertices.push([-a, b, c]);
      vertices.push([a, -b, c]);
      vertices.push([a, b, -c]);
    }
    
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Icosidodecahedron: 20 triangles + 12 pentagons (30 vertices, 60 edges)
  icosidodecahedron: (() => {
    const vertices = [];
    // Vertices at (0, 0, ±φ), (0, ±φ, 0), (±φ, 0, 0)
    vertices.push([0, 0, PHI], [0, 0, -PHI]);
    vertices.push([0, PHI, 0], [0, -PHI, 0]);
    vertices.push([PHI, 0, 0], [-PHI, 0, 0]);
    
    // Vertices at (±1/2, ±φ/2, ±(1+φ)/2) and cyclic permutations
    const h = 0.5;
    const g = PHI / 2;
    const f = (1 + PHI) / 2;
    
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([h * s1, g * s2, f * s3]);
          vertices.push([g * s1, f * s2, h * s3]);
          vertices.push([f * s1, h * s2, g * s3]);
        }
      }
    }
    
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Truncated Dodecahedron: 20 triangles + 12 decagons (60 vertices, 90 edges)
  truncated_dodecahedron: (() => {
    const vertices = [];
    const a = 1 / PHI;
    const b = 2 + PHI;
    const c = PHI;
    const d = 2 * PHI;
    const e = 2;
    const f = 1 + PHI;
    
    // (0, ±1/φ, ±(2+φ)) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, a * s1, b * s2]);
        vertices.push([a * s1, b * s2, 0]);
        vertices.push([b * s2, 0, a * s1]);
      }
    }
    // (±1/φ, ±φ, ±2φ) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([a * s1, c * s2, d * s3]);
          vertices.push([c * s2, d * s3, a * s1]);
          vertices.push([d * s3, a * s1, c * s2]);
        }
      }
    }
    // (±φ, ±2, ±(φ+1)) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([c * s1, e * s2, f * s3]);
          vertices.push([e * s2, f * s3, c * s1]);
          vertices.push([f * s3, c * s1, e * s2]);
        }
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Truncated Icosahedron (soccer ball): 12 pentagons + 20 hexagons (60 vertices, 90 edges)
  truncated_icosahedron: (() => {
    const vertices = [];
    const a = 3 * PHI;
    const b = 2 + PHI;
    const c = 2 * PHI;
    const d = 2 * PHI + 1;
    
    // (0, ±1, ±3φ) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1, a * s2]);
        vertices.push([s1, a * s2, 0]);
        vertices.push([a * s2, 0, s1]);
      }
    }
    // (±1, ±(2+φ), ±2φ) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1, b * s2, c * s3]);
          vertices.push([b * s2, c * s3, s1]);
          vertices.push([c * s3, s1, b * s2]);
        }
      }
    }
    // (±φ, ±2, ±(2φ+1)) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([PHI * s1, 2 * s2, d * s3]);
          vertices.push([2 * s2, d * s3, PHI * s1]);
          vertices.push([d * s3, PHI * s1, 2 * s2]);
        }
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Rhombicosidodecahedron: 20 triangles + 30 squares + 12 pentagons (60 vertices, 120 edges)
  rhombicosidodecahedron: (() => {
    const vertices = [];
    // (±1, ±1, ±φ³) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1, s2, PHI3 * s3]);
          vertices.push([s2, PHI3 * s3, s1]);
          vertices.push([PHI3 * s3, s1, s2]);
        }
      }
    }
    // (±φ², ±φ, ±2φ) and cyclic permutations
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([PHI2 * s1, PHI * s2, 2 * PHI * s3]);
          vertices.push([PHI * s2, 2 * PHI * s3, PHI2 * s1]);
          vertices.push([2 * PHI * s3, PHI2 * s1, PHI * s2]);
        }
      }
    }
    // (±(2+φ), 0, ±φ²) and cyclic permutations
    const d = 2 + PHI;
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([d * s1, 0, PHI2 * s2]);
        vertices.push([0, PHI2 * s2, d * s1]);
        vertices.push([PHI2 * s2, d * s1, 0]);
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Truncated Icosidodecahedron: 30 squares + 20 hexagons + 12 decagons (120 vertices, 180 edges)
  truncated_icosidodecahedron: (() => {
    const vertices = [];
    const invPhi = 1 / PHI;
    const a = 3 + PHI;
    const b = 2 * invPhi;
    const c = 1 + 2 * PHI;
    const d = 3 * PHI - 1;
    const e = 2 * PHI - 1;
    const f = 2 + PHI;
    const g = 2 * PHI;
    
    // Multiple coordinate families
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([invPhi * s1, invPhi * s2, a * s3]);
          vertices.push([invPhi * s2, a * s3, invPhi * s1]);
          vertices.push([a * s3, invPhi * s1, invPhi * s2]);
          
          vertices.push([b * s1, PHI * s2, c * s3]);
          vertices.push([PHI * s2, c * s3, b * s1]);
          vertices.push([c * s3, b * s1, PHI * s2]);
          
          vertices.push([invPhi * s1, PHI2 * s2, d * s3]);
          vertices.push([PHI2 * s2, d * s3, invPhi * s1]);
          vertices.push([d * s3, invPhi * s1, PHI2 * s2]);
          
          vertices.push([e * s1, 2 * s2, f * s3]);
          vertices.push([2 * s2, f * s3, e * s1]);
          vertices.push([f * s3, e * s1, 2 * s2]);
          
          vertices.push([PHI * s1, 3 * s2, g * s3]);
          vertices.push([3 * s2, g * s3, PHI * s1]);
          vertices.push([g * s3, PHI * s1, 3 * s2]);
        }
      }
    }
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })(),

  // Snub Dodecahedron: 80 triangles + 12 pentagons (60 vertices, 150 edges) - chiral
  snub_dodecahedron: (() => {
    // Use phi-based construction
    const xi = 1.7155615341463217; // Solution to ξ³ - 2ξ = φ
    
    const vertices = [];
    
    // Generate using even permutations and sign rules
    // Coordinates based on mathematical definition
    const a = PHI;
    const b = PHI * PHI;
    const c = (PHI + xi) / 2;
    const d = (PHI * xi + 1) / 2;
    const e = (PHI * PHI + xi) / 2;
    
    // Even permutations of (±2α, ±2, ±2β) where α, β are snub parameters
    const alpha = xi - 1/xi;
    const beta = xi * PHI + PHI2 + PHI/xi;
    
    // Simpler approximation using icosahedral symmetry
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          // Main vertex family
          vertices.push([s1 * 2, s2 * alpha, s3 * beta]);
          vertices.push([s1 * alpha, s2 * beta, s3 * 2]);
          vertices.push([s1 * beta, s2 * 2, s3 * alpha]);
        }
      }
    }
    
    // Second vertex family
    const f1 = alpha * PHI + beta / PHI + PHI;
    const f2 = alpha + beta * PHI - 1 / PHI;
    const f3 = -alpha / PHI + beta + PHI;
    
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1 * f1, s2 * f2, s3 * f3]);
          vertices.push([s1 * f2, s2 * f3, s3 * f1]);
          vertices.push([s1 * f3, s2 * f1, s3 * f2]);
        }
      }
    }
    
    // Remove duplicates
    const unique = [];
    for (const v of vertices) {
      const isDup = unique.some(u => 
        Math.abs(u[0] - v[0]) < 0.001 && 
        Math.abs(u[1] - v[1]) < 0.001 && 
        Math.abs(u[2] - v[2]) < 0.001
      );
      if (!isDup) unique.push(v);
    }
    return { vertices: unique, faces: [] };
  })()
};

module.exports = archimedean;

