/**
 * The 4 Kepler-Poinsot Star Polyhedra
 * 
 * These are the only four regular star polyhedra (non-convex regular polyhedra).
 * They have either star polygon faces or star polygon vertex figures.
 */

const PHI = (1 + Math.sqrt(5)) / 2;

const keplerPoinsot = {
  // Small Stellated Dodecahedron: 12 pentagram faces
  // (essentially a dodecahedron with pentagram faces)
  small_stellated_dodecahedron: (() => {
    // Icosahedron vertices at unit distance
    const vertices = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ];
    // Faces are pentagrams (star pentagons)
    // Using icosahedron's 20 triangular faces topology
    return {
      vertices,
      faces: [
        [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
        [1, 6, 8], [1, 7, 6], [1, 9, 7],
        [2, 3, 11], [2, 10, 3], [2, 4, 10], [2, 5, 4], [2, 11, 5],
        [3, 6, 7], [3, 7, 11], [3, 10, 6],
        [4, 8, 10], [5, 11, 9], [6, 10, 8], [7, 9, 11]
      ]
    };
  })(),

  // Great Stellated Dodecahedron: 12 pentagram faces
  great_stellated_dodecahedron: (() => {
    // Extended icosahedron vertices
    const scale = PHI * PHI;
    const vertices = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ].map(v => v.map(c => c * scale));
    return {
      vertices,
      faces: [
        [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
        [1, 6, 8], [1, 7, 6], [1, 9, 7],
        [2, 3, 11], [2, 10, 3], [2, 4, 10], [2, 5, 4], [2, 11, 5],
        [3, 6, 7], [3, 7, 11], [3, 10, 6],
        [4, 8, 10], [5, 11, 9], [6, 10, 8], [7, 9, 11]
      ]
    };
  })(),

  // Great Icosahedron: 20 triangular faces (self-intersecting)
  great_icosahedron: (() => {
    // Icosahedron vertices
    const vertices = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ];
    return {
      vertices,
      faces: [
        [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
        [1, 6, 8], [1, 7, 6], [1, 9, 7],
        [2, 3, 11], [2, 10, 3], [2, 4, 10], [2, 5, 4], [2, 11, 5],
        [3, 6, 7], [3, 7, 11], [3, 10, 6],
        [4, 8, 10], [5, 11, 9], [6, 10, 8], [7, 9, 11]
      ]
    };
  })(),

  // Great Dodecahedron: 12 pentagonal faces (self-intersecting)
  great_dodecahedron: (() => {
    // Same vertices as icosahedron
    const vertices = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
    ];
    // 12 pentagonal faces
    return {
      vertices,
      faces: [
        [0, 4, 8, 1, 9], [0, 5, 2, 4, 8],
        [0, 9, 7, 11, 5], [1, 8, 6, 7, 9],
        [2, 5, 11, 3, 10], [2, 10, 8, 4, 5],
        [3, 11, 7, 6, 10], [3, 10, 6, 1, 7],
        [1, 6, 3, 11, 9], [4, 2, 3, 6, 8],
        [0, 1, 7, 11, 5], [2, 4, 0, 9, 11]
      ]
    };
  })()
};

module.exports = keplerPoinsot;

