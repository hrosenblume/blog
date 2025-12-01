# Polyhedra Library - New Project Plan

Extract the polyhedra system from the blog into a standalone, publishable npm package with TypeScript types, utilities, and Canvas renderer.

## Project Structure

```
polyhedra/
├── src/
│   ├── index.ts              # Main exports
│   ├── shapes/
│   │   ├── index.ts          # Shape registry + getters
│   │   ├── data/
│   │   │   ├── platonic.ts
│   │   │   ├── archimedean.ts
│   │   │   ├── catalan.ts
│   │   │   ├── kepler-poinsot.ts
│   │   │   ├── johnson.ts
│   │   │   └── index.ts
│   │   └── generators/
│   │       ├── prism.ts
│   │       ├── antiprism.ts
│   │       ├── pyramid.ts
│   │       ├── bipyramid.ts
│   │       ├── trapezohedron.ts
│   │       └── index.ts
│   ├── utils/
│   │   ├── index.ts
│   │   ├── edges.ts          # edgesFromFaces, findEdgesByDistance
│   │   ├── normalize.ts      # normalizeVertices, roundVertices
│   │   ├── transform.ts      # rotatePoint, projectPoint
│   │   ├── color.ts          # hexToRgb, darkenColor, etc.
│   │   └── validation.ts     # isConnected, getMinEdgesPerVertex
│   ├── renderer/
│   │   ├── index.ts
│   │   ├── canvas.ts         # renderFrame, draw3DEdge, drawVertexSphere
│   │   └── constants.ts      # EDGE_COLORS, defaults
│   └── types.ts              # Point3D, Edge, Face, Shape, etc.
├── examples/
│   ├── basic.html            # Vanilla JS example
│   └── react/                # React example (separate package.json)
├── scripts/
│   └── build-shapes.ts       # Pre-build JSON for tree-shaking
├── package.json
├── tsconfig.json
├── tsup.config.ts            # Bundle config (ESM + CJS)
├── README.md
├── LICENSE                   # MIT
└── .github/
    └── workflows/
        └── publish.yml       # npm publish on release
```

## API Design

```typescript
// Main exports
import { shapes, generators, render, utils } from 'polyhedra'

// Get shapes
shapes.get('dodecahedron')        // Single shape
shapes.all()                      // All shapes as Record
shapes.names()                    // All shape names
shapes.random()                   // Random shape
shapes.category('platonic')       // Filter by category

// Generators (parametric)
generators.prism(6)               // Hexagonal prism
generators.antiprism(5)           // Pentagonal antiprism
generators.pyramid(4)             // Square pyramid

// Renderer
render.frame(ctx, shape, options) // Render single frame
render.EDGE_COLORS                // Color palette

// Utilities
utils.rotate(point, angleX, angleY, angleZ)
utils.project(point, size, scale)
utils.normalize(vertices)
utils.edgesFromFaces(faces)
```

## Key Files to Port

From current blog codebase:

| Source | Destination | Changes |
|--------|-------------|---------|
| `scripts/polyhedra/data/*.js` | `src/shapes/data/*.ts` | Convert to TypeScript |
| `scripts/polyhedra/build-shapes.js` | `scripts/build-shapes.ts` | Modernize |
| `lib/polyhedra/renderer.ts` | `src/renderer/canvas.ts` | Extract, clean up |
| `lib/polyhedra/shapes.ts` | `src/shapes/index.ts` | Expand API |

## Build Setup

- **Bundler**: tsup (ESM + CJS dual output)
- **TypeScript**: Strict mode, emit declarations
- **Target**: ES2020 (modern browsers + Node 14+)
- **Size goal**: < 50KB minified for shapes data

## Documentation

README will include:
1. Installation (`npm install polyhedra`)
2. Quick start with code examples
3. Shape gallery (auto-generated images)
4. API reference
5. Contributing guide for adding shapes

## Publishing

- Package name: Check npm for availability (`polyhedra`, `polyhedra-js`, `@hunter/polyhedra`)
- Semantic versioning starting at 0.1.0
- GitHub Actions workflow for automated npm publish on release tags

## Implementation Tasks

1. Initialize new repo with package.json, tsconfig, tsup config
2. Create src/types.ts with Point3D, Edge, Face, Shape interfaces
3. Port shape data files from JS to TypeScript modules
4. Port parametric generators (prism, antiprism, pyramid, etc.)
5. Port utility functions (normalize, edges, transform, color)
6. Port Canvas renderer with renderFrame and helpers
7. Implement main API (shapes.get, generators.*, etc.)
8. Create basic HTML example and README documentation
9. Set up npm publishing workflow and GitHub Actions







