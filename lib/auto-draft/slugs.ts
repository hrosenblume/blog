import { prisma } from '@/lib/db'
import { generateSlug } from '@/lib/markdown'

/**
 * Generate a unique slug for a post.
 * If the slug already exists, appends -2, -3, etc.
 */
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title)
  
  // Check if base slug is available
  const existing = await prisma.post.findUnique({ where: { slug: baseSlug } })
  if (!existing) return baseSlug

  // Find next available suffix
  let suffix = 2
  while (suffix < 100) {
    const candidateSlug = `${baseSlug}-${suffix}`
    const exists = await prisma.post.findUnique({ where: { slug: candidateSlug } })
    if (!exists) return candidateSlug
    suffix++
  }

  // Fallback: add random suffix
  return `${baseSlug}-${Date.now()}`
}

