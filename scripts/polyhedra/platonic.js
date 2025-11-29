/**
 * The 5 Platonic Solids - regular convex polyhedra.
 * These are the only five shapes where all faces are identical regular polygons
 * and the same number of faces meet at each vertex.
 */

// Golden ratio for icosahedron and dodecahedron
const PHI = (1 + Math.sqrt(5)) / 2;

const platonic = {
  tetrahedron: {
    vertices: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1]
    ],
    edges: [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [1, 3], [2, 3]
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
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
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
  }
};

module.exports = platonic;
