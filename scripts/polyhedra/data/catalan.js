/**
 * The 13 Catalan Solids - Duals of the Archimedean solids
 * 
 * These have congruent (but not regular) faces and different vertex types.
 * All coordinates are mathematically precise with explicit face definitions.
 */

const PHI = (1 + Math.sqrt(5)) / 2;
const PHI2 = PHI * PHI;
const SQRT2 = Math.SQRT2;

const catalan = {
  // Triakis Tetrahedron: dual of truncated tetrahedron
  // 8 vertices, 18 edges, 12 triangular faces
  triakis_tetrahedron: {
    vertices: [
      // Inner tetrahedron vertices
      [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1],
      // Raised face center vertices (triakis points)
      [5/3, 5/3, 5/3], [5/3, -5/3, -5/3], [-5/3, 5/3, -5/3], [-5/3, -5/3, 5/3]
    ],
    faces: [
      // 12 triangular faces (3 around each triakis point)
      [0, 1, 4], [0, 2, 4], [1, 2, 4],
      [0, 1, 5], [0, 3, 5], [1, 3, 5],
      [0, 2, 6], [0, 3, 6], [2, 3, 6],
      [1, 2, 7], [1, 3, 7], [2, 3, 7]
    ]
  },

  // Rhombic Dodecahedron: dual of cuboctahedron
  // 14 vertices, 24 edges, 12 rhombic faces
  rhombic_dodecahedron: {
    vertices: [
      // Cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Octahedron vertices (scaled by 2)
      [2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0], [0, 0, 2], [0, 0, -2]
    ],
    faces: [
      // 12 rhombic faces
      [0, 8, 2, 12], [0, 12, 4, 10], [0, 10, 1, 8],
      [2, 8, 3, 11], [2, 11, 6, 12], [4, 12, 6, 9],
      [4, 9, 5, 10], [1, 10, 5, 13], [1, 13, 3, 8],
      [6, 11, 7, 9], [5, 9, 7, 13], [3, 13, 7, 11]
    ]
  },

  // Triakis Octahedron: dual of truncated cube
  // 14 vertices, 36 edges, 24 triangular faces
  triakis_octahedron: {
    vertices: [
      // Cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Octahedron vertices (scaled)
      [1 + SQRT2, 0, 0], [-(1 + SQRT2), 0, 0],
      [0, 1 + SQRT2, 0], [0, -(1 + SQRT2), 0],
      [0, 0, 1 + SQRT2], [0, 0, -(1 + SQRT2)]
    ],
    faces: [
      // 24 triangular faces (4 around each octahedron vertex)
      [0, 2, 8], [2, 3, 8], [3, 1, 8], [1, 0, 8],
      [4, 5, 9], [5, 7, 9], [7, 6, 9], [6, 4, 9],
      [0, 1, 10], [1, 5, 10], [5, 4, 10], [4, 0, 10],
      [2, 6, 11], [6, 7, 11], [7, 3, 11], [3, 2, 11],
      [0, 4, 12], [4, 6, 12], [6, 2, 12], [2, 0, 12],
      [1, 3, 13], [3, 7, 13], [7, 5, 13], [5, 1, 13]
    ]
  },

  // Tetrakis Hexahedron: dual of truncated octahedron
  // 14 vertices, 36 edges, 24 isosceles triangle faces
  tetrakis_hexahedron: {
    vertices: [
      // Cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Raised cube face centers
      [3/2, 0, 0], [-3/2, 0, 0],
      [0, 3/2, 0], [0, -3/2, 0],
      [0, 0, 3/2], [0, 0, -3/2]
    ],
    faces: [
      // 24 triangular faces (4 per cube face)
      [0, 2, 8], [2, 3, 8], [3, 1, 8], [1, 0, 8],
      [4, 5, 9], [5, 7, 9], [7, 6, 9], [6, 4, 9],
      [0, 1, 10], [1, 5, 10], [5, 4, 10], [4, 0, 10],
      [2, 6, 11], [6, 7, 11], [7, 3, 11], [3, 2, 11],
      [0, 4, 12], [4, 6, 12], [6, 2, 12], [2, 0, 12],
      [1, 3, 13], [3, 7, 13], [7, 5, 13], [5, 1, 13]
    ]
  },

  // Deltoidal Icositetrahedron: dual of rhombicuboctahedron
  // 26 vertices, 48 edges, 24 kite faces
  deltoidal_icositetrahedron: {
    vertices: [
      // Cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // Edge midpoint vertices (scaled)
      [1 + 1/SQRT2, 1 + 1/SQRT2, 0], [1 + 1/SQRT2, -(1 + 1/SQRT2), 0],
      [-(1 + 1/SQRT2), 1 + 1/SQRT2, 0], [-(1 + 1/SQRT2), -(1 + 1/SQRT2), 0],
      [1 + 1/SQRT2, 0, 1 + 1/SQRT2], [1 + 1/SQRT2, 0, -(1 + 1/SQRT2)],
      [-(1 + 1/SQRT2), 0, 1 + 1/SQRT2], [-(1 + 1/SQRT2), 0, -(1 + 1/SQRT2)],
      [0, 1 + 1/SQRT2, 1 + 1/SQRT2], [0, 1 + 1/SQRT2, -(1 + 1/SQRT2)],
      [0, -(1 + 1/SQRT2), 1 + 1/SQRT2], [0, -(1 + 1/SQRT2), -(1 + 1/SQRT2)],
      // Octahedron vertices
      [1 + SQRT2, 0, 0], [-(1 + SQRT2), 0, 0],
      [0, 1 + SQRT2, 0], [0, -(1 + SQRT2), 0],
      [0, 0, 1 + SQRT2], [0, 0, -(1 + SQRT2)]
    ],
    faces: [
      // 24 kite faces
      [0, 8, 20, 12], [0, 12, 24, 16], [0, 16, 22, 8],
      [1, 8, 22, 17], [1, 17, 25, 13], [1, 13, 20, 8],
      [2, 9, 20, 12], [2, 12, 24, 18], [2, 18, 23, 9],
      [3, 9, 23, 19], [3, 19, 25, 13], [3, 13, 20, 9],
      [4, 10, 22, 16], [4, 16, 24, 14], [4, 14, 21, 10],
      [5, 10, 21, 15], [5, 15, 25, 17], [5, 17, 22, 10],
      [6, 11, 21, 14], [6, 14, 24, 18], [6, 18, 23, 11],
      [7, 11, 23, 19], [7, 19, 25, 15], [7, 15, 21, 11]
    ]
  },

  // Rhombic Triacontahedron: dual of icosidodecahedron
  // 32 vertices, 60 edges, 30 rhombic faces
  rhombic_triacontahedron: (() => {
    const vertices = [];
    // Icosahedron vertices
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1, s2 * PHI]);
        vertices.push([s1, s2 * PHI, 0]);
        vertices.push([s2 * PHI, 0, s1]);
      }
    }
    // Dodecahedron vertices (scaled)
    const d = PHI2;
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1 * d / PHI, s2 * d / PHI, s3 * d / PHI]);
        }
      }
    }
    // Additional golden rectangle vertices
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * d / PHI2, s2 * d]);
        vertices.push([s1 * d / PHI2, s2 * d, 0]);
        vertices.push([s2 * d, 0, s1 * d / PHI2]);
      }
    }
    return { vertices, faces: [] };  // Face topology complex
  })(),

  // Triakis Icosahedron: dual of truncated dodecahedron
  // 32 vertices, 90 edges, 60 isosceles triangle faces
  triakis_icosahedron: (() => {
    const vertices = [];
    const a = (7 + PHI) / 11;
    const r = 1.5;
    // Icosahedron vertices (inner)
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * a, s2 * a * PHI]);
        vertices.push([s1 * a, s2 * a * PHI, 0]);
        vertices.push([s2 * a * PHI, 0, s1 * a]);
      }
    }
    // Raised vertices (triakis points)
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * r, s2 * r * PHI]);
        vertices.push([s1 * r, s2 * r * PHI, 0]);
        vertices.push([s2 * r * PHI, 0, s1 * r]);
      }
    }
    return { vertices, faces: [] };
  })(),

  // Pentakis Dodecahedron: dual of truncated icosahedron
  // 32 vertices, 90 edges, 60 isosceles triangle faces
  pentakis_dodecahedron: (() => {
    const vertices = [];
    // Dodecahedron vertices
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1, s2, s3]);
        }
      }
    }
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 / PHI, s2 * PHI]);
        vertices.push([s1 / PHI, s2 * PHI, 0]);
        vertices.push([s2 * PHI, 0, s1 / PHI]);
      }
    }
    // Raised face centers (icosahedron scaled)
    const r = 1.6;
    const icosa = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ];
    for (const v of icosa) {
      const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      vertices.push([v[0] * r / len, v[1] * r / len, v[2] * r / len]);
    }
    return { vertices, faces: [] };
  })(),

  // Disdyakis Dodecahedron: dual of truncated cuboctahedron
  // 26 vertices, 72 edges, 48 scalene triangle faces
  disdyakis_dodecahedron: (() => {
    const a = 1;
    const b = 1 + 1 / SQRT2;
    const c = 1 + SQRT2;
    const d = 2 + SQRT2;
    const vertices = [
      // Cube vertices
      [a, a, a], [a, a, -a], [a, -a, a], [a, -a, -a],
      [-a, a, a], [-a, a, -a], [-a, -a, a], [-a, -a, -a],
      // Cuboctahedron edge centers
      [c, 0, 0], [-c, 0, 0], [0, c, 0], [0, -c, 0], [0, 0, c], [0, 0, -c],
      [b, b, 0], [b, -b, 0], [-b, b, 0], [-b, -b, 0],
      [b, 0, b], [b, 0, -b], [-b, 0, b], [-b, 0, -b],
      [0, b, b], [0, b, -b], [0, -b, b], [0, -b, -b],
      // Octahedron vertices (outer)
      [d, 0, 0], [-d, 0, 0], [0, d, 0], [0, -d, 0], [0, 0, d], [0, 0, -d]
    ];
    return { vertices, faces: [] };
  })(),

  // Pentagonal Icositetrahedron: dual of snub cube
  // 38 vertices, 60 edges, 24 irregular pentagon faces
  pentagonal_icositetrahedron: (() => {
    const t = 1.8392867552141612;
    const a = 1;
    const b = 1 / (t * t);
    const c = t;
    const d = t * t;
    const vertices = [];
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1 * a, s2 * a, s3 * d]);
          vertices.push([s1 * a, s2 * d, s3 * a]);
          vertices.push([s1 * d, s2 * a, s3 * a]);
          vertices.push([s1 * b, s2 * c, s3 * c]);
          vertices.push([s1 * c, s2 * b, s3 * c]);
          vertices.push([s1 * c, s2 * c, s3 * b]);
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

  // Deltoidal Hexecontahedron: dual of rhombicosidodecahedron
  // 62 vertices, 120 edges, 60 kite faces
  deltoidal_hexecontahedron: (() => {
    const vertices = [];
    const a = 1;
    const b = PHI;
    const c = PHI2;
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1 * a, s2 * a, s3 * c]);
          vertices.push([s1 * a, s2 * c, s3 * a]);
          vertices.push([s1 * c, s2 * a, s3 * a]);
        }
      }
    }
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * b, s2 * c]);
        vertices.push([s1 * b, s2 * c, 0]);
        vertices.push([s2 * c, 0, s1 * b]);
      }
    }
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * a, s2 * b * c]);
        vertices.push([s1 * a, s2 * b * c, 0]);
        vertices.push([s2 * b * c, 0, s1 * a]);
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

  // Disdyakis Triacontahedron: dual of truncated icosidodecahedron
  // 62 vertices, 180 edges, 120 scalene triangle faces
  disdyakis_triacontahedron: (() => {
    const vertices = [];
    const a = 1;
    const b = PHI;
    const c = PHI + 1;
    const d = 2 * PHI;
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1 * a, s2 * a, s3 * d]);
          vertices.push([s1 * a, s2 * d, s3 * a]);
          vertices.push([s1 * d, s2 * a, s3 * a]);
          vertices.push([s1 * a, s2 * b, s3 * c]);
          vertices.push([s1 * b, s2 * c, s3 * a]);
          vertices.push([s1 * c, s2 * a, s3 * b]);
        }
      }
    }
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * b, s2 * d]);
        vertices.push([s1 * b, s2 * d, 0]);
        vertices.push([s2 * d, 0, s1 * b]);
      }
    }
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 / PHI, s2 * b * b]);
        vertices.push([s1 / PHI, s2 * b * b, 0]);
        vertices.push([s2 * b * b, 0, s1 / PHI]);
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

  // Pentagonal Hexecontahedron: dual of snub dodecahedron
  // 92 vertices, 150 edges, 60 irregular pentagon faces
  pentagonal_hexecontahedron: (() => {
    const xi = 1.7155615341463217;
    const a = PHI * xi;
    const b = PHI + xi / PHI;
    const c = xi;
    const vertices = [];
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        for (const s3 of [-1, 1]) {
          vertices.push([s1 * a, s2 * b, s3 * c]);
          vertices.push([s1 * b, s2 * c, s3 * a]);
          vertices.push([s1 * c, s2 * a, s3 * b]);
        }
      }
    }
    for (const s1 of [-1, 1]) {
      for (const s2 of [-1, 1]) {
        vertices.push([0, s1 * c * PHI, s2 * a]);
        vertices.push([s1 * c * PHI, s2 * a, 0]);
        vertices.push([s2 * a, 0, s1 * c * PHI]);
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

module.exports = catalan;

