import { cms } from '@/lib/cms'
import { createAPIHandler } from 'autoblogger'
import { revalidatePath } from 'next/cache'

const baseHandler = createAPIHandler(cms, {
  basePath: '/api/cms',
  onMutate: async (type) => {
    // Revalidate pages when content changes
    if (type === 'post') {
      revalidatePath('/e/[slug]', 'page')
      revalidatePath('/', 'page')
    }
  },
})

export const GET = baseHandler
export const POST = baseHandler
export const PATCH = baseHandler
export const DELETE = baseHandler
