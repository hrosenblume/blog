import { cms } from '@/lib/cms'

export const dynamic = 'force-dynamic'

const BASE = '/writer/api'

async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : url.pathname
  return cms.handlePublicRequest(req, path)
}

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
}
