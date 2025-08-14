import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { name, email, phone, notes } = await req.json()
  try {
    const ownerEmail = process.env.OWNER_EMAIL!
    const owner = await prisma.user.findUnique({ where: { email: ownerEmail } })
    if (!owner) throw new Error('Owner not found')
    if (!email && !name) return NextResponse.json({ error: 'Name or email required' }, { status: 400 })
    const c = await prisma.contact.upsert({
      where: { email_userId: { email: email || `no-email-${Date.now()}@example.com`, userId: owner.id } },
      update: { name, phone, notes },
      create: { userId: owner.id, name: name || '', email: email || `no-email-${Date.now()}@example.com`, phone, notes }
    })
    return NextResponse.json({ ok: true, id: c.id })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
