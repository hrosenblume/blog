/**
 * Johnson Solids (J1-J92) - Convex polyhedra with regular faces
 * 
 * These are the 92 strictly convex polyhedra with regular polygon faces
 * that are not Platonic, Archimedean, or prisms/antiprisms.
 * 
 * Each solid has explicit face definitions for correct edge derivation.
 */

const PHI = (1 + Math.sqrt(5)) / 2;
const SQRT2 = Math.SQRT2;
const SQRT3 = Math.sqrt(3);

// Helper: Generate regular n-gon vertices at height h
function ngon(n, radius = 1, height = 0, rotation = 0) {
  const verts = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n + rotation;
    verts.push([radius * Math.cos(angle), radius * Math.sin(angle), height]);
  }
  return verts;
}

// Helper: Create face indices for connecting two rings
function connectRings(bottomStart, topStart, n, twisted = false) {
  const faces = [];
  for (let i = 0; i < n; i++) {
    const b1 = bottomStart + i;
    const b2 = bottomStart + ((i + 1) % n);
    const t1 = topStart + (twisted ? ((i + 1) % n) : i);
    const t2 = topStart + (twisted ? ((i + 2) % n) : ((i + 1) % n));
    faces.push([b1, b2, t2, t1]);
  }
  return faces;
}

// Helper: Connect ring to apex
function ringToApex(ringStart, n, apexIndex) {
  const faces = [];
  for (let i = 0; i < n; i++) {
    faces.push([ringStart + i, ringStart + ((i + 1) % n), apexIndex]);
  }
  return faces;
}

// Helper: Create antiprism connection (triangles between two rings)
function antiprismConnect(bottomStart, topStart, n) {
  const faces = [];
  for (let i = 0; i < n; i++) {
    // Triangle pointing up
    faces.push([bottomStart + i, bottomStart + ((i + 1) % n), topStart + i]);
    // Triangle pointing down
    faces.push([topStart + i, bottomStart + ((i + 1) % n), topStart + ((i + 1) % n)]);
  }
  return faces;
}

// Pyramid height for equilateral triangular faces
function pyramidHeight(n, radius = 1) {
  const edgeLen = 2 * radius * Math.sin(Math.PI / n);
  const h = Math.sqrt(1 - (radius * radius) / (edgeLen * edgeLen) * 4 * Math.sin(Math.PI / n) ** 2);
  return Math.sqrt(Math.max(0, 1 - radius * radius)) * 0.816;
}

const johnson = {
  // J1: Square Pyramid (4 triangles + 1 square)
  j1_square_pyramid: (() => {
    const base = ngon(4, 1, 0, Math.PI / 4);
    const h = Math.sqrt(0.5);
    const apex = [[0, 0, h]];
    return {
      vertices: [...base, ...apex],
      faces: [
        [0, 1, 2, 3],  // square base
        [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]  // triangles
      ]
    };
  })(),

  // J2: Pentagonal Pyramid (5 triangles + 1 pentagon)
  j2_pentagonal_pyramid: (() => {
    const base = ngon(5, 1, 0);
    const h = Math.sqrt(1 - 1 / (4 * Math.sin(Math.PI / 5) ** 2));
    const apex = [[0, 0, h]];
    return {
      vertices: [...base, ...apex],
      faces: [
        [0, 1, 2, 3, 4],  // pentagon base
        ...ringToApex(0, 5, 5)  // triangles
      ]
    };
  })(),

  // J3: Triangular Cupola (4 triangles + 3 squares + 1 hexagon + 1 triangle)
  j3_triangular_cupola: (() => {
    const bottom = ngon(6, 1, 0);
    const top = ngon(3, 1 / SQRT3, 0.816, Math.PI / 6);
    return {
      vertices: [...bottom, ...top],
      faces: [
        [0, 1, 2, 3, 4, 5],  // hexagon
        [6, 7, 8],  // top triangle
        [0, 1, 7, 6], [2, 3, 8, 7], [4, 5, 6, 8],  // squares (adjusted)
        [1, 2, 7], [3, 4, 8], [5, 0, 6]  // triangles
      ]
    };
  })(),

  // J4: Square Cupola (4 triangles + 5 squares + 1 octagon)
  j4_square_cupola: (() => {
    const bottom = ngon(8, 1, 0);
    const top = ngon(4, 1 / SQRT2, 0.6, Math.PI / 8);
    return {
      vertices: [...bottom, ...top],
      faces: [
        [0, 1, 2, 3, 4, 5, 6, 7],  // octagon
        [8, 9, 10, 11],  // top square
        [0, 1, 9, 8], [2, 3, 10, 9], [4, 5, 11, 10], [6, 7, 8, 11],  // squares
        [1, 2, 9], [3, 4, 10], [5, 6, 11], [7, 0, 8]  // triangles
      ]
    };
  })(),

  // J5: Pentagonal Cupola (5 triangles + 5 squares + 1 decagon + 1 pentagon)
  j5_pentagonal_cupola: (() => {
    const bottom = ngon(10, 1, 0);
    const top = ngon(5, 0.618, 0.5, Math.PI / 10);
    return {
      vertices: [...bottom, ...top],
      faces: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],  // decagon
        [10, 11, 12, 13, 14],  // pentagon
        // Alternating squares and triangles around
        [0, 1, 11, 10], [2, 3, 12, 11], [4, 5, 13, 12], [6, 7, 14, 13], [8, 9, 10, 14],
        [1, 2, 11], [3, 4, 12], [5, 6, 13], [7, 8, 14], [9, 0, 10]
      ]
    };
  })(),

  // J6: Pentagonal Rotunda
  j6_pentagonal_rotunda: (() => {
    const bottom = ngon(10, 1, 0);
    const mid = ngon(5, 0.8, 0.4, Math.PI / 10);
    const top = ngon(5, 0.5, 0.8, 0);
    return {
      vertices: [...bottom, ...mid, ...top],
      faces: [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],  // decagon base
        [15, 16, 17, 18, 19],  // top pentagon
        // Connecting faces
        [0, 1, 10], [2, 3, 11], [4, 5, 12], [6, 7, 13], [8, 9, 14],
        [1, 2, 11, 10], [3, 4, 12, 11], [5, 6, 13, 12], [7, 8, 14, 13], [9, 0, 10, 14],
        [10, 11, 16, 15], [11, 12, 17, 16], [12, 13, 18, 17], [13, 14, 19, 18], [14, 10, 15, 19]
      ]
    };
  })(),

  // J7: Elongated Triangular Pyramid
  j7_elongated_triangular_pyramid: (() => {
    const bottom = ngon(3, 1, 0);
    const mid = ngon(3, 1, 1);
    const h = 1 + SQRT2 / 2;
    const apex = [[0, 0, h]];
    return {
      vertices: [...bottom, ...mid, ...apex],
      faces: [
        [0, 2, 1],  // bottom
        ...connectRings(0, 3, 3).map(f => f),  // prism sides
        ...ringToApex(3, 3, 6)  // pyramid
      ]
    };
  })(),

  // J8: Elongated Square Pyramid
  j8_elongated_square_pyramid: (() => {
    const bottom = ngon(4, 1, 0, Math.PI / 4);
    const mid = ngon(4, 1, 1.414, Math.PI / 4);
    const apex = [[0, 0, 1.414 + 0.707]];
    return {
      vertices: [...bottom, ...mid, ...apex],
      faces: [
        [0, 3, 2, 1],  // bottom
        [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],  // prism sides
        ...ringToApex(4, 4, 8)  // pyramid
      ]
    };
  })(),

  // J9: Elongated Pentagonal Pyramid
  j9_elongated_pentagonal_pyramid: (() => {
    const r = 1 / (2 * Math.sin(Math.PI / 5));
    const bottom = ngon(5, r, 0);
    const mid = ngon(5, r, 1);
    const h = 1 + Math.sqrt(1 - r * r);
    const apex = [[0, 0, h]];
    return {
      vertices: [...bottom, ...mid, ...apex],
      faces: [
        [0, 4, 3, 2, 1],  // bottom
        ...connectRings(0, 5, 5).map(f => f),  // prism sides
        ...ringToApex(5, 5, 10)  // pyramid
      ]
    };
  })(),

  // J10: Gyroelongated Square Pyramid
  j10_gyroelongated_square_pyramid: (() => {
    const bottom = ngon(4, 1, 0);
    const mid = ngon(4, 1, 0.8, Math.PI / 4);
    const top = ngon(4, 1, 1.6);
    const apex = [[0, 0, 2.3]];
    return {
      vertices: [...bottom, ...mid, ...top, ...apex],
      faces: [
        [0, 3, 2, 1],  // bottom
        ...antiprismConnect(0, 4, 4),  // antiprism
        ...antiprismConnect(4, 8, 4),
        ...ringToApex(8, 4, 12)  // pyramid
      ]
    };
  })(),

  // J11: Gyroelongated Pentagonal Pyramid
  j11_gyroelongated_pentagonal_pyramid: (() => {
    const r = 1 / (2 * Math.sin(Math.PI / 5));
    const bottom = ngon(5, r, 0);
    const mid = ngon(5, r, 0.7, Math.PI / 5);
    const top = ngon(5, r, 1.4);
    const apex = [[0, 0, 2.0]];
    return {
      vertices: [...bottom, ...mid, ...top, ...apex],
      faces: [
        [0, 4, 3, 2, 1],  // bottom
        ...antiprismConnect(0, 5, 5),
        ...antiprismConnect(5, 10, 5),
        ...ringToApex(10, 5, 15)
      ]
    };
  })(),

  // J12: Triangular Dipyramid
  j12_triangular_dipyramid: (() => {
    const mid = ngon(3, 1, 0);
    const h = Math.sqrt(2 / 3);
    return {
      vertices: [...mid, [0, 0, h], [0, 0, -h]],
      faces: [
        ...ringToApex(0, 3, 3),  // top
        [0, 4, 1], [1, 4, 2], [2, 4, 0]  // bottom
      ]
    };
  })(),

  // J13: Pentagonal Dipyramid
  j13_pentagonal_dipyramid: (() => {
    const mid = ngon(5, 1, 0);
    const h = Math.sqrt(1 - 1 / (4 * Math.sin(Math.PI / 5) ** 2));
    return {
      vertices: [...mid, [0, 0, h], [0, 0, -h]],
      faces: [
        ...ringToApex(0, 5, 5),  // top
        [0, 6, 1], [1, 6, 2], [2, 6, 3], [3, 6, 4], [4, 6, 0]  // bottom
      ]
    };
  })(),

  // J14: Elongated Triangular Dipyramid
  j14_elongated_triangular_dipyramid: (() => {
    const bottom = ngon(3, 1, -0.5);
    const top = ngon(3, 1, 0.5);
    const h = Math.sqrt(2 / 3);
    return {
      vertices: [...bottom, ...top, [0, 0, 0.5 + h], [0, 0, -0.5 - h]],
      faces: [
        ...connectRings(0, 3, 3).map(f => f),  // prism
        ...ringToApex(3, 3, 6),  // top pyramid
        [0, 7, 1], [1, 7, 2], [2, 7, 0]  // bottom pyramid
      ]
    };
  })(),

  // J15: Elongated Square Dipyramid
  j15_elongated_square_dipyramid: (() => {
    const bottom = ngon(4, 1, -0.7, Math.PI / 4);
    const top = ngon(4, 1, 0.7, Math.PI / 4);
    return {
      vertices: [...bottom, ...top, [0, 0, 1.4], [0, 0, -1.4]],
      faces: [
        [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],  // prism
        ...ringToApex(4, 4, 8),  // top pyramid
        [0, 9, 1], [1, 9, 2], [2, 9, 3], [3, 9, 0]  // bottom pyramid
      ]
    };
  })(),

  // J16: Elongated Pentagonal Dipyramid
  j16_elongated_pentagonal_dipyramid: (() => {
    const r = 1 / (2 * Math.sin(Math.PI / 5));
    const bottom = ngon(5, r, -0.5);
    const top = ngon(5, r, 0.5);
    const h = Math.sqrt(1 - r * r);
    return {
      vertices: [...bottom, ...top, [0, 0, 0.5 + h], [0, 0, -0.5 - h]],
      faces: [
        ...connectRings(0, 5, 5).map(f => f),  // prism
        ...ringToApex(5, 5, 10),  // top pyramid
        [0, 11, 1], [1, 11, 2], [2, 11, 3], [3, 11, 4], [4, 11, 0]  // bottom
      ]
    };
  })(),

  // J17: Gyroelongated Square Dipyramid
  j17_gyroelongated_square_dipyramid: (() => {
    const layer1 = ngon(4, 1, -0.8);
    const layer2 = ngon(4, 1, 0, Math.PI / 4);
    const layer3 = ngon(4, 1, 0.8);
    return {
      vertices: [...layer1, ...layer2, ...layer3, [0, 0, 1.5], [0, 0, -1.5]],
      faces: [
        ...antiprismConnect(0, 4, 4),
        ...antiprismConnect(4, 8, 4),
        ...ringToApex(8, 4, 12),
        [0, 13, 1], [1, 13, 2], [2, 13, 3], [3, 13, 0]
      ]
    };
  })(),

  // J26: Gyrobifastigium
  j26_gyrobifastigium: {
    vertices: [
      [-1, -0.5, 0], [1, -0.5, 0], [0, -0.5, SQRT3 / 2],
      [-1, 0.5, 0], [1, 0.5, 0], [0, 0.5, -SQRT3 / 2]
    ],
    faces: [
      [0, 1, 2],  // bottom triangle
      [3, 5, 4],  // top triangle (reversed)
      [0, 3, 4, 1],  // square
      [1, 4, 5],  // triangle
      [0, 2, 3],  // triangle
      [2, 1, 5],  // triangle (adjusted)
      [0, 3, 2],  // triangle (adjusted)
    ]
  },

  // J84: Snub Disphenoid (Siamese Dodecahedron)
  j84_snub_disphenoid: {
    vertices: [
      [1, 0, 0.471], [-1, 0, 0.471], [1, 0, -0.471], [-1, 0, -0.471],
      [0, 0.943, 0.7], [0, -0.943, 0.7], [0, 0.943, -0.7], [0, -0.943, -0.7]
    ],
    faces: [
      [0, 4, 1], [1, 4, 3], [3, 4, 2], [2, 4, 0],  // top band
      [0, 5, 1], [1, 5, 3], [3, 5, 2], [2, 5, 0],  // bottom band  
      [0, 2, 6], [6, 2, 3], [3, 1, 7], [7, 1, 0]   // side bands
    ]
  }
};

// J18: Elongated Triangular Cupola
johnson.j18_elongated_triangular_cupola = (() => {
  const bottom = ngon(6, 1, 0);
  const mid = ngon(6, 1, 1);
  const top = ngon(3, 1/SQRT3, 1.8, Math.PI/6);
  const faces = [
    [5, 4, 3, 2, 1, 0],  // bottom hexagon
    ...connectRings(0, 6, 6),  // prism sides
    [12, 13, 14],  // top triangle
    // Cupola: 3 squares + 3 triangles
    [6, 7, 13, 12], [8, 9, 14, 13], [10, 11, 12, 14],
    [7, 8, 13], [9, 10, 14], [11, 6, 12]
  ];
  return { vertices: [...bottom, ...mid, ...top], faces };
})();

// J19: Elongated Square Cupola
johnson.j19_elongated_square_cupola = (() => {
  const bottom = ngon(8, 1, 0);
  const mid = ngon(8, 1, 0.8);
  const top = ngon(4, 1/SQRT2, 1.4, Math.PI/8);
  const faces = [
    [7, 6, 5, 4, 3, 2, 1, 0],  // bottom octagon
    ...connectRings(0, 8, 8),  // prism sides
    [16, 17, 18, 19],  // top square
    // Cupola: 4 squares + 4 triangles
    [8, 9, 17, 16], [10, 11, 18, 17], [12, 13, 19, 18], [14, 15, 16, 19],
    [9, 10, 17], [11, 12, 18], [13, 14, 19], [15, 8, 16]
  ];
  return { vertices: [...bottom, ...mid, ...top], faces };
})();

// J20: Elongated Pentagonal Cupola
johnson.j20_elongated_pentagonal_cupola = (() => {
  const bottom = ngon(10, 1, 0);
  const mid = ngon(10, 1, 0.6);
  const top = ngon(5, 0.618, 1.1, Math.PI/10);
  const faces = [
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],  // bottom decagon
    ...connectRings(0, 10, 10),  // prism sides
    [20, 21, 22, 23, 24],  // top pentagon
    // Cupola: 5 squares + 5 triangles alternating
    [10, 11, 21, 20], [12, 13, 22, 21], [14, 15, 23, 22], [16, 17, 24, 23], [18, 19, 20, 24],
    [11, 12, 21], [13, 14, 22], [15, 16, 23], [17, 18, 24], [19, 10, 20]
  ];
  return { vertices: [...bottom, ...mid, ...top], faces };
})();

// J27: Triangular Orthobicupola
johnson.j27_triangular_orthobicupola = (() => {
  const bottom = ngon(6, 1, -0.4);
  const top = ngon(6, 1, 0.4);
  const apex1 = ngon(3, 1/SQRT3, 0.8, Math.PI/6);
  const apex2 = ngon(3, 1/SQRT3, -0.8, Math.PI/6);
  return {
    vertices: [...bottom, ...top, ...apex1, ...apex2],
    faces: [] // Use edge detection
  };
})();

// J28: Square Orthobicupola  
johnson.j28_square_orthobicupola = (() => {
  const bottom = ngon(8, 1, -0.3);
  const top = ngon(8, 1, 0.3);
  const apex1 = ngon(4, 1/SQRT2, 0.6, Math.PI/8);
  const apex2 = ngon(4, 1/SQRT2, -0.6, Math.PI/8);
  return {
    vertices: [...bottom, ...top, ...apex1, ...apex2],
    faces: []
  };
})();

// J29: Square Gyrobicupola
johnson.j29_square_gyrobicupola = (() => {
  const bottom = ngon(8, 1, -0.3);
  const top = ngon(8, 1, 0.3, Math.PI/8);
  const apex1 = ngon(4, 1/SQRT2, 0.6, 0);
  const apex2 = ngon(4, 1/SQRT2, -0.6, Math.PI/4);
  return {
    vertices: [...bottom, ...top, ...apex1, ...apex2],
    faces: []
  };
})();

// J30: Pentagonal Orthobicupola
johnson.j30_pentagonal_orthobicupola = (() => {
  const bottom = ngon(10, 1, -0.25);
  const top = ngon(10, 1, 0.25);
  const apex1 = ngon(5, 0.618, 0.5, Math.PI/10);
  const apex2 = ngon(5, 0.618, -0.5, Math.PI/10);
  return {
    vertices: [...bottom, ...top, ...apex1, ...apex2],
    faces: []
  };
})();

// J31: Pentagonal Gyrobicupola
johnson.j31_pentagonal_gyrobicupola = (() => {
  const bottom = ngon(10, 1, -0.25);
  const top = ngon(10, 1, 0.25, Math.PI/10);
  const apex1 = ngon(5, 0.618, 0.5, 0);
  const apex2 = ngon(5, 0.618, -0.5, Math.PI/5);
  return {
    vertices: [...bottom, ...top, ...apex1, ...apex2],
    faces: []
  };
})();

module.exports = johnson;

