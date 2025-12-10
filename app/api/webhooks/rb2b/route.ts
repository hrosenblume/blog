import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // RB2B webhook payload - uses Title Case field names with spaces
    const email = payload['Business Email']
    const firstName = payload['First Name']
    const lastName = payload['Last Name']
    const linkedIn = payload['LinkedIn URL']
    const title = payload['Title']
    const company = payload['Company Name']
    const companyUrl = payload['Website']
    const industry = payload['Industry']
    const employees = payload['Employee Count']
    const pageUrl = payload['Captured URL']
    const referrer = payload['Referrer']

    // Find or create Lead by email
    let lead
    if (email) {
      lead = await prisma.lead.upsert({
        where: { email },
        update: {
          // Update enriched data if we have newer info
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          linkedIn: linkedIn || undefined,
          title: title || undefined,
          company: company || undefined,
          companyUrl: companyUrl || undefined,
          industry: industry || undefined,
          employees: employees || undefined,
        },
        create: {
          email,
          firstName,
          lastName,
          linkedIn,
          title,
          company,
          companyUrl,
          industry,
          employees,
        },
      })
    } else {
      // No email - create anonymous lead
      lead = await prisma.lead.create({
        data: {
          firstName,
          lastName,
          linkedIn,
          title,
          company,
          companyUrl,
          industry,
          employees,
        },
      })
    }

    // Create visit record
    const visit = await prisma.leadVisit.create({
      data: {
        leadId: lead.id,
        ip: 'unknown', // RB2B doesn't send IP in this format
        pageUrl,
        referrer,
        rawPayload: JSON.stringify(payload),
      },
    })

    console.log(`[RB2B] Lead captured: ${email || lead.id}, visit: ${visit.id}`)

    return NextResponse.json({ success: true, leadId: lead.id, visitId: visit.id })
  } catch (error) {
    console.error('[RB2B Webhook Error]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// RB2B may send GET for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
