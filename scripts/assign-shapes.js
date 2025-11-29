/**
 * Assign polyhedra shapes to all existing posts in the database
 * 
 * Usage: npx dotenv node scripts/assign-shapes.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Load shapes from JSON
const shapes = require(path.join(__dirname, '../lib/polyhedra/shapes.json'));
const SHAPE_NAMES = Object.keys(shapes);

const prisma = new PrismaClient();

function getRandomShape() {
  return SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
}

async function main() {
  console.log(`Available shapes: ${SHAPE_NAMES.length}`);
  
  // Get all posts
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      polyhedraShape: true,
    }
  });

  console.log(`\nFound ${posts.length} posts`);

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    // Assign a new random shape to every post
    const newShape = getRandomShape();
    
    await prisma.post.update({
      where: { id: post.id },
      data: { polyhedraShape: newShape }
    });
    
    console.log(`  Updated: "${post.title}" -> ${newShape}`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} posts, skipped ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

