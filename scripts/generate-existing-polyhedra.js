/**
 * Generate polyhedra GIFs for all published posts that don't have one yet.
 * Run with: node scripts/generate-existing-polyhedra.js
 */

const { PrismaClient } = require('@prisma/client');
const { generatePolyhedronGif } = require('./generate-polyhedra');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Find all published posts (regenerate all with transparent backgrounds)
  const posts = await prisma.post.findMany({
    where: {
      status: 'published',
    },
    select: {
      id: true,
      title: true,
    },
  });

  console.log(`Found ${posts.length} published posts to generate polyhedra GIFs for\n`);

  for (const post of posts) {
    console.log(`Generating GIF for: "${post.title}" (${post.id})`);
    
    try {
      const gifFilename = `post-${post.id}.gif`;
      const outputPath = path.join('public', 'polyhedra', gifFilename);
      
      const result = await generatePolyhedronGif({
        output: outputPath,
        size: 60,
        frames: 24,
        duration: 100,
        transparent: true,
      });
      
      // Update the post with the GIF filename
      await prisma.post.update({
        where: { id: post.id },
        data: { polyhedraGif: gifFilename },
      });
      
      console.log(`  ✓ Generated ${result.shape} → ${gifFilename}\n`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`);
    }
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

