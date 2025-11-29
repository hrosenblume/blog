/**
 * Database seed script
 * 
 * Usage: npm run db:seed
 * 
 * Creates the initial admin user.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed initial admin user
  const adminEmail = 'your-email@example.com'
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Hunter Rosenblume',
        role: 'admin',
      },
    })
    console.log(`Created admin user: ${adminEmail}`)
  } else {
    console.log(`Admin user already exists: ${adminEmail}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
