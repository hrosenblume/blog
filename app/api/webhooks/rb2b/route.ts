import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Lead } from '@prisma/client'

/**
 * Find an existing lead using ONLY truly unique identifiers.
 * 
 * We only dedupe on:
 * 1. Email (unique, verified identifier)
 * 2. LinkedIn URL (unique, verified identifier)
 * 
 * We do NOT dedupe on name+company because:
 * - RB2B only identifies ~40-45% of visitors at person level
 * - Multiple different people from same company would look identical
 * - We'd incorrectly merge different people into one lead
 */
async function findExistingLead(data: {
  email?: string
  linkedIn?: string
}): Promise<Lead | null> {
  const { email, linkedIn } = data

  // Strategy 1: Match by email (unique identifier)
  if (email) {
    const lead = await prisma.lead.findUnique({ where: { email } })
    if (lead) return lead
  }

  // Strategy 2: Match by LinkedIn URL (unique identifier)
  if (linkedIn) {
    const lead = await prisma.lead.findFirst({ where: { linkedIn } })
    if (lead) return lead
  }

  // No unique identifier available - don't try to match
  // Better to create a new lead than incorrectly merge different people
  return null
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // RB2B webhook payload - uses Title Case field names with spaces
    const email = payload['Business Email'] || undefined
    const firstName = payload['First Name'] || undefined
    const lastName = payload['Last Name'] || undefined
    const linkedIn = payload['LinkedIn URL'] || undefined
    const title = payload['Title'] || undefined
    const company = payload['Company Name'] || undefined
    const companyUrl = payload['Website'] || undefined
    const industry = payload['Industry'] || undefined
    const employees = payload['Employee Count'] || undefined
    const pageUrl = payload['Captured URL']
    const referrer = payload['Referrer']

    // Try to find existing lead using unique identifiers only
    let lead = await findExistingLead({ email, linkedIn })

    if (lead) {
      // Update existing lead with any new enriched data
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          // Only update fields if we have new data (don't overwrite with null)
          email: email || lead.email,
          firstName: firstName || lead.firstName,
          lastName: lastName || lead.lastName,
          linkedIn: linkedIn || lead.linkedIn,
          title: title || lead.title,
          company: company || lead.company,
          companyUrl: companyUrl || lead.companyUrl,
          industry: industry || lead.industry,
          employees: employees || lead.employees,
        },
      })
      console.log(`[RB2B] Existing lead matched: ${lead.id}`)
    } else {
      // No match found - create new lead
      lead = await prisma.lead.create({
        data: {
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
      console.log(`[RB2B] New lead created: ${lead.id}`)
    }

    // Create visit record
    const visit = await prisma.leadVisit.create({
      data: {
        leadId: lead.id,
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
