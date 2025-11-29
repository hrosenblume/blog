/**
 * The 4 Kepler-Poinsot Polyhedra - regular star polyhedra.
 * These are the four regular star polyhedra, the 3D analogs of star polygons.
 */

// Golden ratio
const PHI = (1 + Math.sqrt(5)) / 2;

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

// Base icosahedron vertices (normalized)
const icosahedronVertices = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1]
];

// Base dodecahedron vertices
const dodecahedronVertices = (() => {
  const verts = [];
  // Cube vertices
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([sx, sy, sz]);
      }
    }
  }
  // Rectangle vertices
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      verts.push([0, sx / PHI, sy * PHI]);
      verts.push([sx / PHI, sy * PHI, 0]);
      verts.push([sy * PHI, 0, sx / PHI]);
    }
  }
  return verts;
})();

const keplerPoinsot = {
  // Small Stellated Dodecahedron: 12 pentagrammic faces
  // Has icosahedron vertices plus 12 "spike" vertices extending outward
  small_stellated_dodecahedron: (() => {
    const verts = [...icosahedronVertices];
    
    // Add spike vertices - these are at the tips of the star points
    // Each spike is along the direction from center through a face center of the inner dodecahedron
    const spikeLen = PHI * PHI;
    
    // Face centers of inner icosahedron become spike directions
    // (approximately - using dodecahedron vertex directions)
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          verts.push([sx * spikeLen, sy * spikeLen, sz * spikeLen]);
        }
      }
    }
    // Add more spikes along rectangle directions
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        verts.push([0, sx * spikeLen / PHI, sy * spikeLen * PHI]);
        verts.push([sx * spikeLen / PHI, sy * spikeLen * PHI, 0]);
        verts.push([sy * spikeLen * PHI, 0, sx * spikeLen / PHI]);
      }
    }
    
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Great Stellated Dodecahedron: 12 pentagrammic faces (larger)
  // Like small stellated but with longer spikes
  great_stellated_dodecahedron: (() => {
    const verts = [...dodecahedronVertices];
    
    // Spike vertices - longer than small stellated
    const spikeLen = PHI * PHI * PHI;
    
    // Icosahedral directions for spikes
    for (const v of icosahedronVertices) {
      const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      const scale = spikeLen / len;
      verts.push([v[0] * scale, v[1] * scale, v[2] * scale]);
    }
    
    const unique = uniqueVertices(verts);
    return { vertices: unique, edges: findEdgesSmart(unique) };
  })(),

  // Great Dodecahedron: 12 pentagonal faces (self-intersecting)
  // Vertices same as icosahedron, edges connect in pentagons
  great_dodecahedron: (() => {
    const verts = [...icosahedronVertices];
    // Edges skip every other vertex in each face, creating star pattern
    // This creates the star polygon connectivity
    const edges = [];
    
    // For the great dodecahedron, each vertex connects to its 5th neighbors
    // on the icosahedron. We compute edges based on the "pentagram" connectivity.
    const edgeLen = 2; // Pentagram diagonal distance
    
    for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        const v1 = verts[i];
        const v2 = verts[j];
        const dist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);
        // Connect vertices at "pentagram edge" distance (longer than icosahedron edges)
        if (dist > 1.9 && dist < 2.1) {
          edges.push([i, j]);
        }
      }
    }
    
    return { vertices: verts, edges };
  })(),

  // Great Icosahedron: 20 triangular faces (self-intersecting)
  // Vertices same as icosahedron, but edges form larger triangular faces
  great_icosahedron: (() => {
    const verts = [...icosahedronVertices];
    // The great icosahedron has the same vertices as icosahedron
    // but its edges connect more distant vertices
    const edges = [];
    
    // Edge length is PHI times the regular icosahedron edge
    for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        const v1 = verts[i];
        const v2 = verts[j];
        const dist = Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2 + (v1[2]-v2[2])**2);
        // The great icosahedron uses the "second neighbor" edges
        // which are at distance PHI * short_edge ≈ 3.24
        if (dist > 3.0 && dist < 3.5) {
          edges.push([i, j]);
        }
      }
    }
    
    return { vertices: verts, edges };
  })()
};

module.exports = keplerPoinsot;

