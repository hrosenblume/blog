import { PrismaClient } from '@prisma/client'

// Singleton Prisma client to prevent multiple instances
// Works in both development AND production (important for Next.js build workers)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Add connection pool limit to prevent exhaustion during builds
// DigitalOcean managed PostgreSQL has ~22 max connections
// Each build worker and PM2 instance needs connections
function getDatabaseUrl(): string {
  const baseUrl = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL || ''
  
  // If URL already has connection_limit, use as-is
  if (baseUrl.includes('connection_limit=')) {
    return baseUrl
  }
  
  // Append connection_limit to prevent pool exhaustion
  // Use 3 connections per process (Next.js build spawns ~4 workers)
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}connection_limit=3`
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  // Log slow queries in development
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
})

// Always use singleton to prevent connection exhaustion
globalForPrisma.prisma = prisma
