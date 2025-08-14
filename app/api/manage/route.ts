import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCalendarClient } from '@/lib/google'

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || ''
  const booking = await prisma.booking.findUnique({ where: { token }, include: { meetingType: true } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ booking })
}

export async function POST(req: NextRequest) {
  const { token, action } = await req.json()
  const booking = await prisma.booking.findUnique({ where: { token } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (action === 'cancel') {
    const cal = await getCalendarClient()
    if (booking.googleEventId) { try { await cal.events.delete({ calendarId: 'primary', eventId: booking.googleEventId }) } catch {} }
    await prisma.booking.update({ where: { token }, data: { status: 'cancelled' } })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
