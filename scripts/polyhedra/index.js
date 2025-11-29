/**
 * Polyhedra Index - Loads pre-built shapes from shapes.json
 * 
 * Shapes are now built by running: node scripts/polyhedra/build-shapes.js
 * 
 * Available shapes: ~75
 * - 5 Platonic solids
 * - 12 Archimedean solids
 * - 6 Catalan solids
 * - 4 Kepler-Poinsot star polyhedra
 * - ~20 Johnson solids
 * - ~28 Parametric shapes (prisms, antiprisms, pyramids, bipyramids)
 */

const fs = require('fs');
const path = require('path');

// Load pre-built shapes from JSON
const shapesPath = path.join(__dirname, '../../lib/polyhedra/shapes.json');
const POLYHEDRA = JSON.parse(fs.readFileSync(shapesPath, 'utf-8'));

// Export shape names as an array for easy random selection
const SHAPE_NAMES = Object.keys(POLYHEDRA);

// Category information based on naming conventions
const CATEGORIES = {
  platonic: SHAPE_NAMES.filter(n => ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'].includes(n)),
  archimedean: SHAPE_NAMES.filter(n => n.includes('truncated') || n.includes('cuboctahedron') || n.includes('icosidodecahedron') || n.includes('rhombicuboctahedron') || n.includes('rhombicosidodecahedron') || n.includes('snub')),
  catalan: SHAPE_NAMES.filter(n => n.includes('triakis') || n.includes('tetrakis') || n.includes('pentakis') || n.includes('rhombic') || n.includes('deltoidal') || n.includes('disdyakis')),
  keplerPoinsot: SHAPE_NAMES.filter(n => n.includes('stellated') || n.includes('great_icosahedron') || n.includes('great_dodecahedron')),
  johnson: SHAPE_NAMES.filter(n => n.startsWith('j') && /^j\d+/.test(n)),
  parametric: SHAPE_NAMES.filter(n => n.includes('prism') || n.includes('antiprism') || n.includes('pyramid') || n.includes('bipyramid') || n.includes('trapezohedron'))
};

/**
 * Get a random shape name
 * @returns {string} Random shape name
 */
function getRandomShape() {
  return SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
}

/**
 * Get a random shape from a specific category
 * @param {string} category - Category name
 * @returns {string} Random shape name from that category
 */
function getRandomShapeFromCategory(category) {
  const categoryShapes = CATEGORIES[category];
  if (!categoryShapes || categoryShapes.length === 0) {
    throw new Error(`Unknown category: ${category}. Available: ${Object.keys(CATEGORIES).join(', ')}`);
  }
  return categoryShapes[Math.floor(Math.random() * categoryShapes.length)];
}

/**
 * Get shape data by name
 * @param {string} name - Shape name
 * @returns {{ vertices: number[][], edges: number[][] }} Shape vertices and edges
 */
function getShape(name) {
  const shape = POLYHEDRA[name];
  if (!shape) {
    throw new Error(`Unknown shape: ${name}. Available shapes: ${SHAPE_NAMES.length}`);
  }
  return shape;
}

module.exports = {
  POLYHEDRA,
  SHAPE_NAMES,
  CATEGORIES,
  getRandomShape,
  getRandomShapeFromCategory,
  getShape
};
