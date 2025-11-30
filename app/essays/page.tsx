import Link from 'next/link'
import { prisma } from '@/lib/db'
import { EssayLink } from '@/components/EssayLink'
import { HOMEPAGE } from '@/lib/homepage'
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata = {
  title: 'All Essays',
  description: `All essays by ${HOMEPAGE.name}`,
}

export default async function EssaysPage() {
  const essays = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      polyhedraShape: true,
    },
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <Link 
              href="/"
              className="inline-flex items-center min-h-[44px] px-3 py-2 -mx-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors mb-4"
            >
              ← Home
            </Link>
            <h1 className="text-title font-bold">All Essays</h1>
            <p className="text-muted-foreground mt-1">
              {essays.length} essay{essays.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ThemeToggle size="md" />
        </header>

        {/* Essays list */}
        {essays.length === 0 ? (
          <p className="text-muted-foreground">No essays published yet.</p>
        ) : (
          <div className="-mx-6">
            {essays.map((essay, index) => (
              <EssayLink 
                key={essay.id} 
                slug={essay.slug}
                title={essay.title}
                subtitle={essay.subtitle}
                polyhedraShape={essay.polyhedraShape}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

