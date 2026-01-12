import { cms } from '@/lib/cms'
import { createAPIHandler } from 'autoblogger'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

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

// #region agent log
async function instrumentedHandler(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isAISettings = path.includes('/ai/settings')
  
  if (isAISettings) {
    fetch('http://127.0.0.1:7242/ingest/6799878c-0e78-4c4f-a4fe-aa1599d04e47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/cms/route.ts:entry',message:'CMS AI settings request',data:{path,method:req.method},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  }
  
  const response = await baseHandler(req)
  
  if (isAISettings && req.method === 'GET') {
    const cloned = response.clone()
    const body = await cloned.json()
    fetch('http://127.0.0.1:7242/ingest/6799878c-0e78-4c4f-a4fe-aa1599d04e47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/cms/route.ts:response',message:'CMS AI settings response',data:{hasDataWrapper:!!body.data,hasDefaultPlanRules:!!(body.data?.defaultPlanRules || body.defaultPlanRules),responseKeys:Object.keys(body).slice(0,10)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
  }
  
  return response
}
// #endregion

export const GET = instrumentedHandler
export const POST = instrumentedHandler
export const PATCH = instrumentedHandler
export const DELETE = instrumentedHandler
