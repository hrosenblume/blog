/**
 * Database seed script
 * 
 * Usage: npm run db:seed
 * 
 * Creates the initial admin user and seeds published essays.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Embedded essay data (no external dependencies)
const SEED_ESSAYS = [
  {
    id: '8ea8b439-806a-47e7-bf68-89f968abcbf1',
    title: 'P³ Startups',
    slug: 'ppp-startups',
    subtitle: 'The $6T market for public-private partnerships',
    polyhedraShape: 'hexagonal_bipyramid',
    publishedAt: new Date(1731628800000),
    markdown: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`,
  },
  {
    id: 'e7c6cf02-82df-42d9-be0d-4bfeb31672a2',
    title: 'The Art of Simplicity',
    slug: 'the-art-of-simplicity',
    subtitle: 'Why less is often more in design and life',
    polyhedraShape: 'j84_snub_disphenoid',
    publishedAt: new Date(1728950400000),
    markdown: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`,
  },
  {
    id: 'd5b4cf4b-7048-4784-9ea6-6f7b9feeac0c',
    title: 'Building in Private',
    slug: 'building-in-private',
    subtitle: "Why I don't share anything with anyone",
    polyhedraShape: 'j15_elongated_square_dipyramid',
    publishedAt: new Date(1726358400000),
    markdown: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`,
  },
  {
    id: 'd3aa74fe-5bf5-44d7-8792-869bc3211ad2',
    title: 'Why I Write',
    slug: 'why-i-write',
    subtitle: 'Finding clarity through putting thoughts into words',
    polyhedraShape: 'j31_pentagonal_gyrobicupola',
    publishedAt: new Date(1723680000000),
    markdown: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`,
  },
  {
    id: '527201e9-4b91-439f-8798-0f551af075a8',
    title: 'Thoughts on Minimalism',
    slug: 'thoughts-on-minimalism',
    subtitle: 'Choosing intentionality over accumulation',
    polyhedraShape: 'triakis_octahedron',
    publishedAt: new Date(1721001600000),
    markdown: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`,
  },
]

async function seedAdmin() {
  const adminEmail = process.env.WRITER_EMAIL
  const adminName = process.env.WRITER_NAME
  
  if (!adminEmail) {
    console.log(`· WRITER_EMAIL not set in env, skipping admin user creation`)
    return
  }
  
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: 'admin',
      },
    })
    console.log(`✓ Created admin user: ${adminEmail}`)
  } else {
    console.log(`· Admin user already exists: ${adminEmail}`)
  }
}

async function seedEssays() {
  const postCount = await prisma.post.count()
  
  if (postCount > 0) {
    console.log(`· Posts already exist (${postCount}), skipping seed`)
    return
  }

  console.log(`Seeding essays...`)
  
  for (const essay of SEED_ESSAYS) {
    await prisma.post.create({
      data: {
        id: essay.id,
        title: essay.title,
        slug: essay.slug,
        markdown: essay.markdown,
        status: 'published',
        polyhedraShape: essay.polyhedraShape,
        publishedAt: essay.publishedAt,
        subtitle: essay.subtitle,
      },
    })
    console.log(`✓ Seeded: ${essay.title}`)
  }

  console.log(`✓ Seeded ${SEED_ESSAYS.length} essays`)
}

async function main() {
  await seedAdmin()
  await seedEssays()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
