/**
 * The 5 Platonic Solids - Mathematically precise with explicit faces
 * 
 * These are the only five convex regular polyhedra:
 * - Tetrahedron (4 triangular faces)
 * - Cube/Hexahedron (6 square faces)
 * - Octahedron (8 triangular faces)
 * - Dodecahedron (12 pentagonal faces)
 * - Icosahedron (20 triangular faces)
 */

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618

const platonic = {
  tetrahedron: {
    vertices: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1]
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2]
    ]
  },

  cube: {
    vertices: [
      [-1, -1, -1], // 0
      [1, -1, -1],  // 1
      [1, 1, -1],   // 2
      [-1, 1, -1],  // 3
      [-1, -1, 1],  // 4
      [1, -1, 1],   // 5
      [1, 1, 1],    // 6
      [-1, 1, 1]    // 7
    ],
    faces: [
      [0, 1, 2, 3], // back
      [4, 7, 6, 5], // front
      [0, 4, 5, 1], // bottom
      [2, 6, 7, 3], // top
      [0, 3, 7, 4], // left
      [1, 5, 6, 2]  // right
    ]
  },

  octahedron: {
    vertices: [
      [1, 0, 0],  // 0
      [-1, 0, 0], // 1
      [0, 1, 0],  // 2
      [0, -1, 0], // 3
      [0, 0, 1],  // 4
      [0, 0, -1]  // 5
    ],
    faces: [
      [0, 2, 4],
      [0, 4, 3],
      [0, 3, 5],
      [0, 5, 2],
      [1, 4, 2],
      [1, 3, 4],
      [1, 5, 3],
      [1, 2, 5]
    ]
  },

  dodecahedron: {
    vertices: [
      // Cube vertices (±1, ±1, ±1)
      [1, 1, 1],    // 0
      [1, 1, -1],   // 1
      [1, -1, 1],   // 2
      [1, -1, -1],  // 3
      [-1, 1, 1],   // 4
      [-1, 1, -1],  // 5
      [-1, -1, 1],  // 6
      [-1, -1, -1], // 7
      // Rectangle vertices (0, ±1/φ, ±φ)
      [0, 1/PHI, PHI],   // 8
      [0, 1/PHI, -PHI],  // 9
      [0, -1/PHI, PHI],  // 10
      [0, -1/PHI, -PHI], // 11
      // Rectangle vertices (±1/φ, ±φ, 0)
      [1/PHI, PHI, 0],   // 12
      [1/PHI, -PHI, 0],  // 13
      [-1/PHI, PHI, 0],  // 14
      [-1/PHI, -PHI, 0], // 15
      // Rectangle vertices (±φ, 0, ±1/φ)
      [PHI, 0, 1/PHI],   // 16
      [PHI, 0, -1/PHI],  // 17
      [-PHI, 0, 1/PHI],  // 18
      [-PHI, 0, -1/PHI]  // 19
    ],
    faces: [
      [0, 8, 10, 2, 16],
      [0, 16, 17, 1, 12],
      [0, 12, 14, 4, 8],
      [1, 17, 3, 11, 9],
      [1, 9, 5, 14, 12],
      [2, 10, 6, 15, 13],
      [2, 13, 3, 17, 16],
      [3, 13, 15, 7, 11],
      [4, 14, 5, 19, 18],
      [4, 18, 6, 10, 8],
      [5, 9, 11, 7, 19],
      [6, 18, 19, 7, 15]
    ]
  },

  icosahedron: {
    vertices: [
      [0, 1, PHI],   // 0
      [0, -1, PHI],  // 1
      [0, 1, -PHI],  // 2
      [0, -1, -PHI], // 3
      [1, PHI, 0],   // 4
      [-1, PHI, 0],  // 5
      [1, -PHI, 0],  // 6
      [-1, -PHI, 0], // 7
      [PHI, 0, 1],   // 8
      [-PHI, 0, 1],  // 9
      [PHI, 0, -1],  // 10
      [-PHI, 0, -1]  // 11
    ],
    faces: [
      [0, 1, 8],
      [0, 8, 4],
      [0, 4, 5],
      [0, 5, 9],
      [0, 9, 1],
      [1, 6, 8],
      [1, 7, 6],
      [1, 9, 7],
      [2, 3, 11],
      [2, 10, 3],
      [2, 4, 10],
      [2, 5, 4],
      [2, 11, 5],
      [3, 6, 7],
      [3, 7, 11],
      [3, 10, 6],
      [4, 8, 10],
      [5, 11, 9],
      [6, 10, 8],
      [7, 9, 11]
    ]
  }
};

module.exports = platonic;


