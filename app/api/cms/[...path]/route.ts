import { cms } from '@/lib/cms'
import { createAPIHandler } from 'autoblogger'
import { revalidatePath } from 'next/cache'

const handler = createAPIHandler(cms, {
  basePath: '/api/cms',
  onMutate: async (type) => {
    // Revalidate pages when content changes
    if (type === 'post') {
      revalidatePath('/e/[slug]', 'page')
      revalidatePath('/', 'page')
    }
  },
})

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
