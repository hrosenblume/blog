import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // RB2B webhook payload structure (adjust field names based on actual payload)
    const {
      email,
      first_name,
      last_name,
      linkedin_url,
      title,
      company_name,
      company_website,
      industry,
      employee_count,
      ip_address,
      user_agent,
      page_url,
      referrer,
    } = payload

    // Find or create Lead by email
    let lead
    if (email) {
      lead = await prisma.lead.upsert({
        where: { email },
        update: {
          // Update enriched data if we have newer info
          firstName: first_name || undefined,
          lastName: last_name || undefined,
          linkedIn: linkedin_url || undefined,
          title: title || undefined,
          company: company_name || undefined,
          companyUrl: company_website || undefined,
          industry: industry || undefined,
          employees: employee_count || undefined,
        },
        create: {
          email,
          firstName: first_name,
          lastName: last_name,
          linkedIn: linkedin_url,
          title: title,
          company: company_name,
          companyUrl: company_website,
          industry: industry,
          employees: employee_count,
        },
      })
    } else {
      // No email - create anonymous lead
      lead = await prisma.lead.create({
        data: {
          firstName: first_name,
          lastName: last_name,
          linkedIn: linkedin_url,
          title: title,
          company: company_name,
          companyUrl: company_website,
          industry: industry,
          employees: employee_count,
        },
      })
    }

    // Create visit record
    const visit = await prisma.leadVisit.create({
      data: {
        leadId: lead.id,
        ip: ip_address || 'unknown',
        userAgent: user_agent,
        pageUrl: page_url,
        referrer: referrer,
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
