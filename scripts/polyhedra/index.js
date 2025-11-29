/**
 * Polyhedra Index - Combines all polyhedra from all sources.
 * 
 * Total shapes: ~175
 * - 5 Platonic solids
 * - 13 Archimedean solids
 * - 13 Catalan solids
 * - 4 Kepler-Poinsot star polyhedra
 * - 92 Johnson solids
 * - 48 Parametric shapes (prisms, antiprisms, pyramids, bipyramids, trapezohedra)
 */

const platonic = require('./platonic');
const archimedean = require('./archimedean');
const catalan = require('./catalan');
const keplerPoinsot = require('./kepler-poinsot');
const johnson = require('./johnson');
const { generateAllParametric } = require('./generators');

// Combine all polyhedra into a single object
const ALL_POLYHEDRA = {
  ...platonic,
  ...archimedean,
  ...catalan,
  ...keplerPoinsot,
  ...johnson,
  ...generateAllParametric()
};

// Validate shape quality - filter out visually sparse shapes
function isValidShape(shape) {
  if (!shape || !shape.vertices || !shape.edges) return false;
  // Require minimum visual substance
  if (shape.vertices.length < 8) return false;  // At least cube-level complexity
  if (shape.edges.length < 12) return false;
  return true;
}

// Filter to only valid shapes
const POLYHEDRA = {};
for (const [name, shape] of Object.entries(ALL_POLYHEDRA)) {
  if (isValidShape(shape)) {
    POLYHEDRA[name] = shape;
  }
}

// Export shape names as an array for easy random selection
const SHAPE_NAMES = Object.keys(POLYHEDRA);

// Category information for potential filtering
const CATEGORIES = {
  platonic: Object.keys(platonic),
  archimedean: Object.keys(archimedean),
  catalan: Object.keys(catalan),
  keplerPoinsot: Object.keys(keplerPoinsot),
  johnson: Object.keys(johnson),
  parametric: Object.keys(generateAllParametric())
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
 * @param {string} category - Category name (platonic, archimedean, catalan, keplerPoinsot, johnson, parametric)
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

