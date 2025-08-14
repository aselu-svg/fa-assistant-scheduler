import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const ownerEmail = process.env.OWNER_EMAIL!
  const user = await prisma.user.findUnique({ where: { email: ownerEmail } })
  if (!user) return NextResponse.json({ error: 'Owner not found' }, { status: 400 })
  const s = await prisma.settings.findUnique({ where: { userId: user.id } })
  return NextResponse.json(s)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const ownerEmail = process.env.OWNER_EMAIL!
  const user = await prisma.user.findUnique({ where: { email: ownerEmail } })
  if (!user) return NextResponse.json({ error: 'Owner not found' }, { status: 400 })
  const s = await prisma.settings.upsert({
    where: { userId: user.id },
    update: {
      calendarId: body.calendarId || 'primary',
      businessStart: Number(body.businessStart || 9),
      businessEnd: Number(body.businessEnd || 17),
      slotStepMinutes: Number(body.slotStepMinutes || 30),
      minNoticeHours: Number(body.minNoticeHours || 24),
      bufferMinutes: Number(body.bufferMinutes || 10)
    },
    create: {
      userId: user.id,
      calendarId: body.calendarId || 'primary',
      businessStart: Number(body.businessStart || 9),
      businessEnd: Number(body.businessEnd || 17),
      slotStepMinutes: Number(body.slotStepMinutes || 30),
      minNoticeHours: Number(body.minNoticeHours || 24),
      bufferMinutes: Number(body.bufferMinutes || 10)
    }
  })
  return NextResponse.json(s)
}
