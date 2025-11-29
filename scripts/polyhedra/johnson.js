/**
 * The 92 Johnson Solids (J1-J92)
 * Convex polyhedra with regular polygon faces that are not Platonic, Archimedean, or prisms/antiprisms.
 * Named after Norman Johnson who enumerated them in 1966.
 */

// Golden ratio
const PHI = (1 + Math.sqrt(5)) / 2;

// Common height calculations
const SQRT2 = Math.SQRT2;
const SQRT3 = Math.sqrt(3);
const SQRT5 = Math.sqrt(5);

// Helper to remove duplicate vertices
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

// Helper to find edges - improved to detect multiple edge lengths
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

// Find all distinct edge lengths in a set of vertices (for polyhedra with uniform edges)
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
  
  // Find clusters of similar distances
  const clusters = [];
  let currentCluster = [distances[0]];
  
  for (let i = 1; i < distances.length; i++) {
    const avgCluster = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
    if (distances[i] - avgCluster < tolerance * avgCluster) {
      currentCluster.push(distances[i]);
    } else {
      if (currentCluster.length >= 3) { // Only keep clusters with enough edges
        clusters.push({
          min: Math.min(...currentCluster) * 0.95,
          max: Math.max(...currentCluster) * 1.05,
          count: currentCluster.length
        });
      }
      currentCluster = [distances[i]];
    }
  }
  // Don't forget the last cluster
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
    // Add only new edges
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

// Helper to find shortest edge
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

// Generate regular n-gon vertices at a given height
function regularNGon(n, radius = 1, height = 0, rotationOffset = 0) {
  const vertices = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n + rotationOffset;
    vertices.push([radius * Math.cos(angle), radius * Math.sin(angle), height]);
  }
  return vertices;
}

// Pyramid height for equilateral triangular faces
function pyramidHeight(n, radius = 1) {
  // For unit edge length, height = sqrt(1 - r^2) where r is circumradius of base
  const edgeLen = 2 * radius * Math.sin(Math.PI / n);
  return Math.sqrt(1 - radius * radius) * edgeLen;
}

// Cupola half-height
function cupolaHeight(n) {
  return Math.sqrt(1 - 1/(4 * Math.pow(Math.cos(Math.PI/(2*n)), 2)));
}

const johnson = {
  // J1: Square Pyramid
  j1_square_pyramid: (() => {
    const base = regularNGon(4, 1, 0);
    const apex = [[0, 0, Math.sqrt(0.5)]];
    const verts = [...base, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J2: Pentagonal Pyramid
  j2_pentagonal_pyramid: (() => {
    const base = regularNGon(5, 1, 0);
    const h = Math.sqrt(1 - 1/(4 * Math.pow(Math.sin(Math.PI/5), 2)));
    const apex = [[0, 0, h]];
    const verts = [...base, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J3: Triangular Cupola
  j3_triangular_cupola: (() => {
    const bottom = regularNGon(6, 1, 0);
    const top = regularNGon(3, 1/SQRT3, 0.8, Math.PI/6);
    const verts = [...bottom, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J4: Square Cupola
  j4_square_cupola: (() => {
    const bottom = regularNGon(8, 1, 0);
    const top = regularNGon(4, 1/SQRT2, 0.6, Math.PI/8);
    const verts = [...bottom, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J5: Pentagonal Cupola
  j5_pentagonal_cupola: (() => {
    const bottom = regularNGon(10, 1, 0);
    const top = regularNGon(5, 0.618, 0.5, Math.PI/10);
    const verts = [...bottom, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J6: Pentagonal Rotunda
  j6_pentagonal_rotunda: (() => {
    const bottom = regularNGon(10, 1, 0);
    const mid = regularNGon(5, 0.8, 0.4, Math.PI/10);
    const top = regularNGon(5, 0.5, 0.8, 0);
    const apex = [[0, 0, 1.1]];
    const verts = [...bottom, ...mid, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J7: Elongated Triangular Pyramid
  j7_elongated_triangular_pyramid: (() => {
    const bottom = regularNGon(3, 1, 0);
    const mid = regularNGon(3, 1, 1);
    const apex = [[0, 0, 1 + SQRT2/2]];
    const verts = [...bottom, ...mid, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J8: Elongated Square Pyramid
  j8_elongated_square_pyramid: (() => {
    const bottom = regularNGon(4, 1, 0);
    const mid = regularNGon(4, 1, 1.414);
    const apex = [[0, 0, 1.414 + 0.707]];
    const verts = [...bottom, ...mid, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J9: Elongated Pentagonal Pyramid
  j9_elongated_pentagonal_pyramid: (() => {
    const r = 1 / (2 * Math.sin(Math.PI/5));
    const bottom = regularNGon(5, r, 0);
    const mid = regularNGon(5, r, 1);
    const h = Math.sqrt(1 - r*r);
    const apex = [[0, 0, 1 + h]];
    const verts = [...bottom, ...mid, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J10: Gyroelongated Square Pyramid
  j10_gyroelongated_square_pyramid: (() => {
    const bottom = regularNGon(4, 1, 0);
    const mid = regularNGon(4, 1, 0.8, Math.PI/4);
    const top = regularNGon(4, 1, 1.6);
    const apex = [[0, 0, 2.3]];
    const verts = [...bottom, ...mid, ...top, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J11: Gyroelongated Pentagonal Pyramid
  j11_gyroelongated_pentagonal_pyramid: (() => {
    const r = 1 / (2 * Math.sin(Math.PI/5));
    const bottom = regularNGon(5, r, 0);
    const mid = regularNGon(5, r, 0.7, Math.PI/5);
    const top = regularNGon(5, r, 1.4);
    const apex = [[0, 0, 2.0]];
    const verts = [...bottom, ...mid, ...top, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J12: Triangular Dipyramid
  j12_triangular_dipyramid: (() => {
    const mid = regularNGon(3, 1, 0);
    const h = Math.sqrt(2/3);
    const top = [[0, 0, h]];
    const bottom = [[0, 0, -h]];
    const verts = [...mid, ...top, ...bottom];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J13: Pentagonal Dipyramid
  j13_pentagonal_dipyramid: (() => {
    const mid = regularNGon(5, 1, 0);
    const h = Math.sqrt(1 - 1/(4 * Math.pow(Math.sin(Math.PI/5), 2)));
    const top = [[0, 0, h]];
    const bottom = [[0, 0, -h]];
    const verts = [...mid, ...top, ...bottom];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J14: Elongated Triangular Dipyramid
  j14_elongated_triangular_dipyramid: (() => {
    const bottom = regularNGon(3, 1, -0.5);
    const top = regularNGon(3, 1, 0.5);
    const h = Math.sqrt(2/3);
    const apex1 = [[0, 0, 0.5 + h]];
    const apex2 = [[0, 0, -0.5 - h]];
    const verts = [...bottom, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J15: Elongated Square Dipyramid
  j15_elongated_square_dipyramid: (() => {
    const bottom = regularNGon(4, 1, -0.7);
    const top = regularNGon(4, 1, 0.7);
    const apex1 = [[0, 0, 1.4]];
    const apex2 = [[0, 0, -1.4]];
    const verts = [...bottom, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J16: Elongated Pentagonal Dipyramid
  j16_elongated_pentagonal_dipyramid: (() => {
    const r = 1 / (2 * Math.sin(Math.PI/5));
    const bottom = regularNGon(5, r, -0.5);
    const top = regularNGon(5, r, 0.5);
    const h = Math.sqrt(1 - r*r);
    const apex1 = [[0, 0, 0.5 + h]];
    const apex2 = [[0, 0, -0.5 - h]];
    const verts = [...bottom, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J17: Gyroelongated Square Dipyramid
  j17_gyroelongated_square_dipyramid: (() => {
    const layer1 = regularNGon(4, 1, -0.8);
    const layer2 = regularNGon(4, 1, 0, Math.PI/4);
    const layer3 = regularNGon(4, 1, 0.8);
    const apex1 = [[0, 0, 1.5]];
    const apex2 = [[0, 0, -1.5]];
    const verts = [...layer1, ...layer2, ...layer3, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J18: Elongated Triangular Cupola
  j18_elongated_triangular_cupola: (() => {
    const bottom = regularNGon(6, 1, 0);
    const mid = regularNGon(6, 1, 1);
    const top = regularNGon(3, 1/SQRT3, 1.8, Math.PI/6);
    const verts = [...bottom, ...mid, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J19: Elongated Square Cupola
  j19_elongated_square_cupola: (() => {
    const bottom = regularNGon(8, 1, 0);
    const mid = regularNGon(8, 1, 0.8);
    const top = regularNGon(4, 1/SQRT2, 1.4, Math.PI/8);
    const verts = [...bottom, ...mid, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J20: Elongated Pentagonal Cupola
  j20_elongated_pentagonal_cupola: (() => {
    const bottom = regularNGon(10, 1, 0);
    const mid = regularNGon(10, 1, 0.6);
    const top = regularNGon(5, 0.618, 1.1, Math.PI/10);
    const verts = [...bottom, ...mid, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J21: Elongated Pentagonal Rotunda
  j21_elongated_pentagonal_rotunda: (() => {
    const bottom = regularNGon(10, 1, 0);
    const mid1 = regularNGon(10, 1, 0.5);
    const mid2 = regularNGon(5, 0.8, 0.9, Math.PI/10);
    const top = regularNGon(5, 0.5, 1.3, 0);
    const verts = [...bottom, ...mid1, ...mid2, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J22: Gyroelongated Triangular Cupola
  j22_gyroelongated_triangular_cupola: (() => {
    const bottom = regularNGon(6, 1, 0);
    const mid = regularNGon(6, 1, 0.7, Math.PI/6);
    const mid2 = regularNGon(6, 1, 1.4);
    const top = regularNGon(3, 1/SQRT3, 2.2, Math.PI/6);
    const verts = [...bottom, ...mid, ...mid2, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J23: Gyroelongated Square Cupola
  j23_gyroelongated_square_cupola: (() => {
    const bottom = regularNGon(8, 1, 0);
    const mid = regularNGon(8, 1, 0.6, Math.PI/8);
    const mid2 = regularNGon(8, 1, 1.2);
    const top = regularNGon(4, 1/SQRT2, 1.8, Math.PI/8);
    const verts = [...bottom, ...mid, ...mid2, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J24: Gyroelongated Pentagonal Cupola
  j24_gyroelongated_pentagonal_cupola: (() => {
    const bottom = regularNGon(10, 1, 0);
    const mid = regularNGon(10, 1, 0.5, Math.PI/10);
    const mid2 = regularNGon(10, 1, 1.0);
    const top = regularNGon(5, 0.618, 1.5, Math.PI/10);
    const verts = [...bottom, ...mid, ...mid2, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J25: Gyroelongated Pentagonal Rotunda
  j25_gyroelongated_pentagonal_rotunda: (() => {
    const bottom = regularNGon(10, 1, 0);
    const mid1 = regularNGon(10, 1, 0.4, Math.PI/10);
    const mid2 = regularNGon(10, 1, 0.8);
    const mid3 = regularNGon(5, 0.8, 1.2, Math.PI/10);
    const top = regularNGon(5, 0.5, 1.6, 0);
    const verts = [...bottom, ...mid1, ...mid2, ...mid3, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J26: Gyrobifastigium
  j26_gyrobifastigium: (() => {
    const verts = [
      [-1, -0.5, 0], [1, -0.5, 0], [0, -0.5, 0.866],
      [-1, 0.5, 0], [1, 0.5, 0], [0, 0.5, -0.866]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J27: Triangular Orthobicupola
  j27_triangular_orthobicupola: (() => {
    const bottom = regularNGon(6, 1, -0.4);
    const mid = regularNGon(3, 1/SQRT3, 0, Math.PI/6);
    const top = regularNGon(6, 1, 0.4);
    const apex1 = regularNGon(3, 1/SQRT3, 0.8, Math.PI/6);
    const apex2 = regularNGon(3, 1/SQRT3, -0.8, Math.PI/6);
    const verts = [...bottom, ...mid, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J28: Square Orthobicupola
  j28_square_orthobicupola: (() => {
    const bottom = regularNGon(8, 1, -0.3);
    const mid = regularNGon(4, 1/SQRT2, 0, Math.PI/8);
    const top = regularNGon(8, 1, 0.3);
    const apex1 = regularNGon(4, 1/SQRT2, 0.6, Math.PI/8);
    const apex2 = regularNGon(4, 1/SQRT2, -0.6, Math.PI/8);
    const verts = [...bottom, ...mid, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J29: Square Gyrobicupola
  j29_square_gyrobicupola: (() => {
    const bottom = regularNGon(8, 1, -0.3);
    const mid = regularNGon(4, 1/SQRT2, 0, 0);
    const top = regularNGon(8, 1, 0.3, Math.PI/8);
    const apex1 = regularNGon(4, 1/SQRT2, 0.6, 0);
    const apex2 = regularNGon(4, 1/SQRT2, -0.6, Math.PI/4);
    const verts = [...bottom, ...mid, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J30: Pentagonal Orthobicupola
  j30_pentagonal_orthobicupola: (() => {
    const bottom = regularNGon(10, 1, -0.25);
    const mid = regularNGon(5, 0.618, 0, Math.PI/10);
    const top = regularNGon(10, 1, 0.25);
    const apex1 = regularNGon(5, 0.618, 0.5, Math.PI/10);
    const apex2 = regularNGon(5, 0.618, -0.5, Math.PI/10);
    const verts = [...bottom, ...mid, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J31: Pentagonal Gyrobicupola
  j31_pentagonal_gyrobicupola: (() => {
    const bottom = regularNGon(10, 1, -0.25);
    const mid = regularNGon(5, 0.618, 0, 0);
    const top = regularNGon(10, 1, 0.25, Math.PI/10);
    const apex1 = regularNGon(5, 0.618, 0.5, 0);
    const apex2 = regularNGon(5, 0.618, -0.5, Math.PI/5);
    const verts = [...bottom, ...mid, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J32: Pentagonal Orthocupolarotunda
  j32_pentagonal_orthocupolarotunda: (() => {
    const bottom = regularNGon(10, 1, 0);
    const cupola = regularNGon(5, 0.618, 0.5, Math.PI/10);
    const rotunda1 = regularNGon(5, 0.8, -0.4, Math.PI/10);
    const rotunda2 = regularNGon(5, 0.5, -0.8, 0);
    const verts = [...bottom, ...cupola, ...rotunda1, ...rotunda2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J33: Pentagonal Gyrocupolarotunda
  j33_pentagonal_gyrocupolarotunda: (() => {
    const bottom = regularNGon(10, 1, 0);
    const cupola = regularNGon(5, 0.618, 0.5, 0);
    const rotunda1 = regularNGon(5, 0.8, -0.4, Math.PI/10);
    const rotunda2 = regularNGon(5, 0.5, -0.8, 0);
    const verts = [...bottom, ...cupola, ...rotunda1, ...rotunda2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J34: Pentagonal Orthobirotunda
  j34_pentagonal_orthobirotunda: (() => {
    const mid = regularNGon(10, 1, 0);
    const r1_top = regularNGon(5, 0.8, 0.4, Math.PI/10);
    const r1_apex = regularNGon(5, 0.5, 0.8, 0);
    const r2_top = regularNGon(5, 0.8, -0.4, Math.PI/10);
    const r2_apex = regularNGon(5, 0.5, -0.8, 0);
    const verts = [...mid, ...r1_top, ...r1_apex, ...r2_top, ...r2_apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J35: Elongated Triangular Orthobicupola
  j35_elongated_triangular_orthobicupola: (() => {
    const bottom = regularNGon(6, 1, -0.8);
    const mid1 = regularNGon(6, 1, -0.4);
    const mid2 = regularNGon(6, 1, 0.4);
    const top = regularNGon(6, 1, 0.8);
    const apex1 = regularNGon(3, 1/SQRT3, 1.2, Math.PI/6);
    const apex2 = regularNGon(3, 1/SQRT3, -1.2, Math.PI/6);
    const verts = [...bottom, ...mid1, ...mid2, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J36: Elongated Triangular Gyrobicupola
  j36_elongated_triangular_gyrobicupola: (() => {
    const bottom = regularNGon(6, 1, -0.8);
    const mid1 = regularNGon(6, 1, -0.4);
    const mid2 = regularNGon(6, 1, 0.4, Math.PI/6);
    const top = regularNGon(6, 1, 0.8, Math.PI/6);
    const apex1 = regularNGon(3, 1/SQRT3, 1.2, 0);
    const apex2 = regularNGon(3, 1/SQRT3, -1.2, Math.PI/6);
    const verts = [...bottom, ...mid1, ...mid2, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J37: Elongated Square Gyrobicupola
  j37_elongated_square_gyrobicupola: (() => {
    const bottom = regularNGon(8, 1, -0.6);
    const mid1 = regularNGon(8, 1, -0.2);
    const mid2 = regularNGon(8, 1, 0.2, Math.PI/8);
    const top = regularNGon(8, 1, 0.6, Math.PI/8);
    const apex1 = regularNGon(4, 1/SQRT2, 0.9, 0);
    const apex2 = regularNGon(4, 1/SQRT2, -0.9, Math.PI/4);
    const verts = [...bottom, ...mid1, ...mid2, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J38: Elongated Pentagonal Orthobicupola
  j38_elongated_pentagonal_orthobicupola: (() => {
    const bottom = regularNGon(10, 1, -0.5);
    const mid1 = regularNGon(10, 1, -0.1);
    const mid2 = regularNGon(10, 1, 0.3);
    const top = regularNGon(10, 1, 0.7);
    const apex1 = regularNGon(5, 0.618, 1.0, Math.PI/10);
    const apex2 = regularNGon(5, 0.618, -0.8, Math.PI/10);
    const verts = [...bottom, ...mid1, ...mid2, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J39: Elongated Pentagonal Gyrobicupola
  j39_elongated_pentagonal_gyrobicupola: (() => {
    const bottom = regularNGon(10, 1, -0.5);
    const mid1 = regularNGon(10, 1, -0.1);
    const mid2 = regularNGon(10, 1, 0.3, Math.PI/10);
    const top = regularNGon(10, 1, 0.7, Math.PI/10);
    const apex1 = regularNGon(5, 0.618, 1.0, 0);
    const apex2 = regularNGon(5, 0.618, -0.8, Math.PI/5);
    const verts = [...bottom, ...mid1, ...mid2, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J40: Elongated Pentagonal Orthocupolarotunda
  j40_elongated_pentagonal_orthocupolarotunda: (() => {
    const bottom = regularNGon(10, 1, -0.5);
    const mid = regularNGon(10, 1, 0.1);
    const cupola = regularNGon(5, 0.618, 0.6, Math.PI/10);
    const rot1 = regularNGon(5, 0.8, -0.9, Math.PI/10);
    const rot2 = regularNGon(5, 0.5, -1.3, 0);
    const verts = [...bottom, ...mid, ...cupola, ...rot1, ...rot2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J41: Elongated Pentagonal Gyrocupolarotunda
  j41_elongated_pentagonal_gyrocupolarotunda: (() => {
    const bottom = regularNGon(10, 1, -0.5);
    const mid = regularNGon(10, 1, 0.1, Math.PI/10);
    const cupola = regularNGon(5, 0.618, 0.6, 0);
    const rot1 = regularNGon(5, 0.8, -0.9, Math.PI/10);
    const rot2 = regularNGon(5, 0.5, -1.3, 0);
    const verts = [...bottom, ...mid, ...cupola, ...rot1, ...rot2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J42: Elongated Pentagonal Orthobirotunda
  j42_elongated_pentagonal_orthobirotunda: (() => {
    const mid1 = regularNGon(10, 1, -0.3);
    const mid2 = regularNGon(10, 1, 0.3);
    const r1_top = regularNGon(5, 0.8, 0.7, Math.PI/10);
    const r1_apex = regularNGon(5, 0.5, 1.1, 0);
    const r2_top = regularNGon(5, 0.8, -0.7, Math.PI/10);
    const r2_apex = regularNGon(5, 0.5, -1.1, 0);
    const verts = [...mid1, ...mid2, ...r1_top, ...r1_apex, ...r2_top, ...r2_apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J43: Elongated Pentagonal Gyrobirotunda
  j43_elongated_pentagonal_gyrobirotunda: (() => {
    const mid1 = regularNGon(10, 1, -0.3);
    const mid2 = regularNGon(10, 1, 0.3, Math.PI/10);
    const r1_top = regularNGon(5, 0.8, 0.7, 0);
    const r1_apex = regularNGon(5, 0.5, 1.1, Math.PI/10);
    const r2_top = regularNGon(5, 0.8, -0.7, Math.PI/10);
    const r2_apex = regularNGon(5, 0.5, -1.1, 0);
    const verts = [...mid1, ...mid2, ...r1_top, ...r1_apex, ...r2_top, ...r2_apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J44: Gyroelongated Triangular Bicupola
  j44_gyroelongated_triangular_bicupola: (() => {
    const bottom = regularNGon(6, 1, -1.0);
    const mid1 = regularNGon(6, 1, -0.5, Math.PI/6);
    const mid2 = regularNGon(6, 1, 0, 0);
    const mid3 = regularNGon(6, 1, 0.5, Math.PI/6);
    const top = regularNGon(6, 1, 1.0);
    const apex1 = regularNGon(3, 1/SQRT3, 1.4, Math.PI/6);
    const apex2 = regularNGon(3, 1/SQRT3, -1.4, Math.PI/6);
    const verts = [...bottom, ...mid1, ...mid2, ...mid3, ...top, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J45: Gyroelongated Square Bicupola
  j45_gyroelongated_square_bicupola: (() => {
    const bottom = regularNGon(8, 1, -0.8);
    const mid1 = regularNGon(8, 1, -0.3, Math.PI/8);
    const mid2 = regularNGon(8, 1, 0.2);
    const mid3 = regularNGon(8, 1, 0.7, Math.PI/8);
    const apex1 = regularNGon(4, 1/SQRT2, 1.0, Math.PI/8);
    const apex2 = regularNGon(4, 1/SQRT2, -1.1, Math.PI/8);
    const verts = [...bottom, ...mid1, ...mid2, ...mid3, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J46: Gyroelongated Pentagonal Bicupola
  j46_gyroelongated_pentagonal_bicupola: (() => {
    const bottom = regularNGon(10, 1, -0.7);
    const mid1 = regularNGon(10, 1, -0.3, Math.PI/10);
    const mid2 = regularNGon(10, 1, 0.1);
    const mid3 = regularNGon(10, 1, 0.5, Math.PI/10);
    const apex1 = regularNGon(5, 0.618, 0.8, Math.PI/10);
    const apex2 = regularNGon(5, 0.618, -1.0, Math.PI/10);
    const verts = [...bottom, ...mid1, ...mid2, ...mid3, ...apex1, ...apex2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J47: Gyroelongated Pentagonal Cupolarotunda
  j47_gyroelongated_pentagonal_cupolarotunda: (() => {
    const bottom = regularNGon(10, 1, -0.6);
    const mid1 = regularNGon(10, 1, -0.2, Math.PI/10);
    const mid2 = regularNGon(10, 1, 0.2);
    const cupola = regularNGon(5, 0.618, 0.5, Math.PI/10);
    const rot1 = regularNGon(5, 0.8, -1.0, Math.PI/10);
    const rot2 = regularNGon(5, 0.5, -1.4, 0);
    const verts = [...bottom, ...mid1, ...mid2, ...cupola, ...rot1, ...rot2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J48: Gyroelongated Pentagonal Birotunda
  j48_gyroelongated_pentagonal_birotunda: (() => {
    const mid1 = regularNGon(10, 1, -0.4);
    const mid2 = regularNGon(10, 1, 0, Math.PI/10);
    const mid3 = regularNGon(10, 1, 0.4);
    const r1_top = regularNGon(5, 0.8, 0.8, Math.PI/10);
    const r1_apex = regularNGon(5, 0.5, 1.2, 0);
    const r2_top = regularNGon(5, 0.8, -0.8, Math.PI/10);
    const r2_apex = regularNGon(5, 0.5, -1.2, 0);
    const verts = [...mid1, ...mid2, ...mid3, ...r1_top, ...r1_apex, ...r2_top, ...r2_apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J49: Augmented Triangular Prism
  j49_augmented_triangular_prism: (() => {
    const bottom = regularNGon(3, 1, 0);
    const top = regularNGon(3, 1, 1);
    const pyramid = [[1.5, 0, 0.5]]; // Pyramid on one square face
    const verts = [...bottom, ...top, ...pyramid];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J50: Biaugmented Triangular Prism
  j50_biaugmented_triangular_prism: (() => {
    const bottom = regularNGon(3, 1, 0);
    const top = regularNGon(3, 1, 1);
    const pyr1 = [[1.5, 0, 0.5]];
    const pyr2 = [[-0.75, 1.3, 0.5]];
    const verts = [...bottom, ...top, ...pyr1, ...pyr2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J51: Triaugmented Triangular Prism
  j51_triaugmented_triangular_prism: (() => {
    const bottom = regularNGon(3, 1, 0);
    const top = regularNGon(3, 1, 1);
    const pyr1 = [[1.5, 0, 0.5]];
    const pyr2 = [[-0.75, 1.3, 0.5]];
    const pyr3 = [[-0.75, -1.3, 0.5]];
    const verts = [...bottom, ...top, ...pyr1, ...pyr2, ...pyr3];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J52: Augmented Pentagonal Prism
  j52_augmented_pentagonal_prism: (() => {
    const r = 1 / (2 * Math.sin(Math.PI/5));
    const bottom = regularNGon(5, r, 0);
    const top = regularNGon(5, r, 1);
    const pyr = [[r + 0.5, 0, 0.5]];
    const verts = [...bottom, ...top, ...pyr];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J53: Biaugmented Pentagonal Prism
  j53_biaugmented_pentagonal_prism: (() => {
    const r = 1 / (2 * Math.sin(Math.PI/5));
    const bottom = regularNGon(5, r, 0);
    const top = regularNGon(5, r, 1);
    const pyr1 = [[r + 0.5, 0, 0.5]];
    const pyr2 = [[-r - 0.5, 0, 0.5]];
    const verts = [...bottom, ...top, ...pyr1, ...pyr2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J54: Augmented Hexagonal Prism
  j54_augmented_hexagonal_prism: (() => {
    const bottom = regularNGon(6, 1, 0);
    const top = regularNGon(6, 1, 1);
    const pyr = [[1.5, 0, 0.5]];
    const verts = [...bottom, ...top, ...pyr];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J55: Parabiaugmented Hexagonal Prism
  j55_parabiaugmented_hexagonal_prism: (() => {
    const bottom = regularNGon(6, 1, 0);
    const top = regularNGon(6, 1, 1);
    const pyr1 = [[1.5, 0, 0.5]];
    const pyr2 = [[-1.5, 0, 0.5]];
    const verts = [...bottom, ...top, ...pyr1, ...pyr2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J56: Metabiaugmented Hexagonal Prism
  j56_metabiaugmented_hexagonal_prism: (() => {
    const bottom = regularNGon(6, 1, 0);
    const top = regularNGon(6, 1, 1);
    const pyr1 = [[1.5, 0, 0.5]];
    const pyr2 = [[0, 1.5, 0.5]];
    const verts = [...bottom, ...top, ...pyr1, ...pyr2];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J57: Triaugmented Hexagonal Prism
  j57_triaugmented_hexagonal_prism: (() => {
    const bottom = regularNGon(6, 1, 0);
    const top = regularNGon(6, 1, 1);
    const pyr1 = [[1.5, 0, 0.5]];
    const pyr2 = [[-0.75, 1.3, 0.5]];
    const pyr3 = [[-0.75, -1.3, 0.5]];
    const verts = [...bottom, ...top, ...pyr1, ...pyr2, ...pyr3];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J58: Augmented Dodecahedron
  j58_augmented_dodecahedron: (() => {
    const verts = [];
    // Dodecahedron vertices
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
    // Add pyramid apex
    verts.push([0, 0, PHI + 0.5]);
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J59: Parabiaugmented Dodecahedron
  j59_parabiaugmented_dodecahedron: (() => {
    const verts = [];
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
    verts.push([0, 0, PHI + 0.5]);
    verts.push([0, 0, -PHI - 0.5]);
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J60: Metabiaugmented Dodecahedron
  j60_metabiaugmented_dodecahedron: (() => {
    const verts = [];
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
    verts.push([0, 0, PHI + 0.5]);
    verts.push([PHI + 0.5, 0, 0]);
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J61: Triaugmented Dodecahedron
  j61_triaugmented_dodecahedron: (() => {
    const verts = [];
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
    verts.push([0, 0, PHI + 0.5]);
    verts.push([PHI + 0.5, 0, 0]);
    verts.push([0, PHI + 0.5, 0]);
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J62: Metabidiminished Icosahedron
  j62_metabidiminished_icosahedron: (() => {
    const verts = [
      [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J63: Tridiminished Icosahedron
  j63_tridiminished_icosahedron: (() => {
    const verts = [
      [0, 1, PHI], [0, -1, PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J64: Augmented Tridiminished Icosahedron
  j64_augmented_tridiminished_icosahedron: (() => {
    const verts = [
      [0, 1, PHI], [0, -1, PHI],
      [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0],
      [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1],
      [0, 0, PHI + 0.7] // Pyramid apex
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J65: Augmented Truncated Tetrahedron
  j65_augmented_truncated_tetrahedron: (() => {
    const verts = [
      [3, 1, 1], [3, -1, -1], [-3, 1, -1], [-3, -1, 1],
      [1, 3, 1], [-1, 3, -1], [1, -3, -1], [-1, -3, 1],
      [1, 1, 3], [-1, -1, 3], [1, -1, -3], [-1, 1, -3],
      [0, 0, 4.5] // Pyramid apex on one hexagonal face
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J66: Augmented Truncated Cube
  j66_augmented_truncated_cube: (() => {
    const r = Math.SQRT2 - 1;
    const verts = [];
    for (const [a, b, c] of [[1, r, r], [r, 1, r], [r, r, 1]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([a * sx, b * sy, c * sz]);
          }
        }
      }
    }
    verts.push([0, 0, 1.5]); // Pyramid on octagonal face
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J67: Biaugmented Truncated Cube
  j67_biaugmented_truncated_cube: (() => {
    const r = Math.SQRT2 - 1;
    const verts = [];
    for (const [a, b, c] of [[1, r, r], [r, 1, r], [r, r, 1]]) {
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          for (const sz of [-1, 1]) {
            verts.push([a * sx, b * sy, c * sz]);
          }
        }
      }
    }
    verts.push([0, 0, 1.5]);
    verts.push([0, 0, -1.5]);
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J68: Augmented Truncated Dodecahedron
  j68_augmented_truncated_dodecahedron: (() => {
    const verts = [];
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([0, sy / PHI, sz * (2 + PHI)]);
        verts.push([0, sy * (2 + PHI), sz / PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy * PHI, sz * 2 * PHI]);
          verts.push([sx * PHI, sy * 2, sz * (PHI + 1)]);
        }
      }
    }
    verts.push([0, 0, (2 + PHI) + 0.8]); // Pyramid apex
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J69: Parabiaugmented Truncated Dodecahedron
  j69_parabiaugmented_truncated_dodecahedron: (() => {
    const verts = [];
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([0, sy / PHI, sz * (2 + PHI)]);
        verts.push([0, sy * (2 + PHI), sz / PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy * PHI, sz * 2 * PHI]);
          verts.push([sx * PHI, sy * 2, sz * (PHI + 1)]);
        }
      }
    }
    verts.push([0, 0, (2 + PHI) + 0.8]);
    verts.push([0, 0, -(2 + PHI) - 0.8]);
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J70: Metabiaugmented Truncated Dodecahedron
  j70_metabiaugmented_truncated_dodecahedron: (() => {
    const verts = [];
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([0, sy / PHI, sz * (2 + PHI)]);
        verts.push([0, sy * (2 + PHI), sz / PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy * PHI, sz * 2 * PHI]);
          verts.push([sx * PHI, sy * 2, sz * (PHI + 1)]);
        }
      }
    }
    verts.push([0, 0, (2 + PHI) + 0.8]);
    verts.push([(2 + PHI) + 0.8, 0, 0]);
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J71: Triaugmented Truncated Dodecahedron
  j71_triaugmented_truncated_dodecahedron: (() => {
    const verts = [];
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([0, sy / PHI, sz * (2 + PHI)]);
        verts.push([0, sy * (2 + PHI), sz / PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx / PHI, sy * PHI, sz * 2 * PHI]);
          verts.push([sx * PHI, sy * 2, sz * (PHI + 1)]);
        }
      }
    }
    verts.push([0, 0, (2 + PHI) + 0.8]);
    verts.push([(2 + PHI) + 0.8, 0, 0]);
    verts.push([0, (2 + PHI) + 0.8, 0]);
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J72: Gyrate Rhombicosidodecahedron
  j72_gyrate_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy, sz * PHI * PHI * PHI]);
          verts.push([sx * PHI * PHI, sy * PHI, sz * 2 * PHI]);
        }
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx * (2 + PHI), 0, sy * PHI * PHI]);
        verts.push([0, sx * (2 + PHI), sy * PHI * PHI]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J73: Parabigyrate Rhombicosidodecahedron
  j73_parabigyrate_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy, sz * PHI * PHI * PHI]);
          verts.push([sx * PHI * PHI, sy * PHI, sz * 2 * PHI]);
        }
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx * (2 + PHI), sy * PHI * PHI, 0]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J74: Metabigyrate Rhombicosidodecahedron
  j74_metabigyrate_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy, sz * PHI * PHI * PHI]);
          verts.push([sx * PHI * PHI, sy * PHI, sz * 2 * PHI]);
        }
      }
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([sx * (2 + PHI), 0, sz * PHI * PHI]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J75: Trigyrate Rhombicosidodecahedron
  j75_trigyrate_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx, sy, sz * PHI * PHI * PHI]);
          verts.push([sx * PHI * PHI, sy * PHI, sz * 2 * PHI]);
        }
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J76: Diminished Rhombicosidodecahedron
  j76_diminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx, sy, PHI * PHI * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx * (2 + PHI), 0, sy * PHI * PHI]);
        verts.push([0, sx * (2 + PHI), sy * PHI * PHI]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J77: Paragyrate Diminished Rhombicosidodecahedron
  j77_paragyrate_diminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx, sy, PHI * PHI * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      verts.push([sx * (2 + PHI), 0, PHI * PHI]);
      verts.push([0, sx * (2 + PHI), -PHI * PHI]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J78: Metagyrate Diminished Rhombicosidodecahedron
  j78_metagyrate_diminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx, sy, PHI * PHI * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      verts.push([sx * (2 + PHI), 0, PHI * PHI]);
      verts.push([sx * (2 + PHI), 0, -PHI * PHI]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J79: Bigyrate Diminished Rhombicosidodecahedron
  j79_bigyrate_diminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx, sy, PHI * PHI * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      verts.push([sx * (2 + PHI), 0, PHI * PHI]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J80: Parabidiminished Rhombicosidodecahedron
  j80_parabidiminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, -2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx * (2 + PHI), 0, sy * PHI * PHI]);
        verts.push([0, sx * (2 + PHI), sy * PHI * PHI]);
      }
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J81: Metabidiminished Rhombicosidodecahedron
  j81_metabidiminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx, sy, PHI * PHI * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      verts.push([0, sx * (2 + PHI), PHI * PHI]);
      verts.push([0, sx * (2 + PHI), -PHI * PHI]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J82: Gyrate Bidiminished Rhombicosidodecahedron
  j82_gyrate_bidiminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx, sy, PHI * PHI * PHI]);
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sy of [-1, 1]) {
      verts.push([0, (2 + PHI), sy * PHI * PHI]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J83: Tridiminished Rhombicosidodecahedron
  j83_tridiminished_rhombicosidodecahedron: (() => {
    const verts = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([sx * PHI * PHI, sy * PHI, 2 * PHI]);
      }
    }
    for (const sx of [-1, 1]) {
      verts.push([sx * (2 + PHI), 0, PHI * PHI]);
      verts.push([0, sx * (2 + PHI), PHI * PHI]);
    }
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // J84: Snub Disphenoid (Siamese Dodecahedron)
  j84_snub_disphenoid: (() => {
    const a = 1;
    const b = 0.943;
    const c = 0.471;
    const verts = [
      [a, 0, c], [-a, 0, c], [a, 0, -c], [-a, 0, -c],
      [0, b, 0.7], [0, -b, 0.7], [0, b, -0.7], [0, -b, -0.7]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J85: Snub Square Antiprism
  j85_snub_square_antiprism: (() => {
    const bottom = regularNGon(8, 1, 0);
    const mid = regularNGon(8, 0.8, 0.5, Math.PI/8);
    const top = regularNGon(8, 1, 1, Math.PI/8);
    const apex = [[0, 0, 1.5]];
    const verts = [...bottom, ...mid, ...top, ...apex];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J86: Sphenocorona
  j86_sphenocorona: (() => {
    const verts = [
      [1, 0, 0], [-1, 0, 0],
      [0.5, 0.866, 0.3], [-0.5, 0.866, 0.3],
      [0.5, -0.866, 0.3], [-0.5, -0.866, 0.3],
      [0, 0.5, 0.9], [0, -0.5, 0.9],
      [0, 0, 1.2]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J87: Augmented Sphenocorona
  j87_augmented_sphenocorona: (() => {
    const verts = [
      [1, 0, 0], [-1, 0, 0],
      [0.5, 0.866, 0.3], [-0.5, 0.866, 0.3],
      [0.5, -0.866, 0.3], [-0.5, -0.866, 0.3],
      [0, 0.5, 0.9], [0, -0.5, 0.9],
      [0, 0, 1.2],
      [0, 1.2, 0.5] // Additional pyramid
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J88: Sphenomegacorona
  j88_sphenomegacorona: (() => {
    const verts = [
      [1, 0, 0], [-1, 0, 0],
      [0.5, 0.866, 0.2], [-0.5, 0.866, 0.2],
      [0.5, -0.866, 0.2], [-0.5, -0.866, 0.2],
      [0.8, 0.4, 0.6], [-0.8, 0.4, 0.6],
      [0.8, -0.4, 0.6], [-0.8, -0.4, 0.6],
      [0, 0, 1.1]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J89: Hebesphenomegacorona
  j89_hebesphenomegacorona: (() => {
    const verts = [
      [1, 0, 0], [-1, 0, 0],
      [0.6, 0.8, 0.2], [-0.6, 0.8, 0.2],
      [0.6, -0.8, 0.2], [-0.6, -0.8, 0.2],
      [0.3, 0.5, 0.7], [-0.3, 0.5, 0.7],
      [0.3, -0.5, 0.7], [-0.3, -0.5, 0.7],
      [0.8, 0, 0.5], [-0.8, 0, 0.5],
      [0, 0, 1.0]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J90: Disphenocingulum
  j90_disphenocingulum: (() => {
    const bottom = regularNGon(4, 1, 0);
    const mid1 = regularNGon(4, 1.2, 0.4, Math.PI/4);
    const mid2 = regularNGon(4, 1.2, 0.8);
    const top = regularNGon(4, 1, 1.2, Math.PI/4);
    const verts = [...bottom, ...mid1, ...mid2, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J91: Bilunabirotunda
  j91_bilunabirotunda: (() => {
    const verts = [
      // Two "luna" shapes connected
      [1, 0, 0.5], [-1, 0, 0.5], [1, 0, -0.5], [-1, 0, -0.5],
      [0.5, 0.866, 0.5], [-0.5, 0.866, 0.5],
      [0.5, 0.866, -0.5], [-0.5, 0.866, -0.5],
      [0.5, -0.866, 0.5], [-0.5, -0.866, 0.5],
      [0.5, -0.866, -0.5], [-0.5, -0.866, -0.5],
      [0, 0, 1], [0, 0, -1]
    ];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })(),

  // J92: Triangular Hebesphenorotunda
  j92_triangular_hebesphenorotunda: (() => {
    const bottom = regularNGon(6, 1, 0);
    const mid1 = regularNGon(3, 0.8, 0.4, Math.PI/6);
    const mid2 = regularNGon(6, 0.7, 0.7, 0);
    const top = regularNGon(3, 0.4, 1.0, Math.PI/6);
    const verts = [...bottom, ...mid1, ...mid2, ...top];
    return { vertices: verts, edges: findEdgesSmart(verts) };
  })()
};

module.exports = johnson;

