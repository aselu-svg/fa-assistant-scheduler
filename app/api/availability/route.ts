import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/google'
import { prisma } from '@/lib/prisma'
import { addMinutes, rangeTimes } from '@/lib/tz'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const dateStr = url.searchParams.get('date')
  const meetingSlug = url.searchParams.get('meetingSlug') || 'intro-30'
  const adminUpcoming = url.searchParams.get('adminUpcoming')
  try {
    const ownerEmail = process.env.OWNER_EMAIL!
    const owner = await prisma.user.findUnique({ where: { email: ownerEmail } })
    if (!owner) throw new Error('Owner not found')
    const s = await prisma.settings.findUnique({ where: { userId: owner.id } })
    if (!s) throw new Error('Settings missing. Run seed.')
    const cal = await getCalendarClient()
    const meetingType = await prisma.meetingType.findUnique({ where: { slug: meetingSlug } })
    const duration = meetingType?.durationMinutes ?? 30
    const calendarId = s.calendarId || 'primary'
    if (adminUpcoming) {
      const now = new Date(); const in7 = new Date(now.getTime() + 7*24*60*60*1000)
      const events = await cal.events.list({ calendarId, timeMin: now.toISOString(), timeMax: in7.toISOString(), singleEvents: true, orderBy: 'startTime' })
      return NextResponse.json({ events: (events.data.items || []).map(e => ({ id: e.id, start: e.start?.dateTime || e.start?.date, end: e.end?.dateTime || e.end?.date, summary: e.summary })) })
    }
    if (!dateStr) return NextResponse.json({ slots: [] })
    const day = new Date(dateStr + 'T00:00:00')
    const startOfDay = new Date(day); startOfDay.setHours(s.businessStart, 0, 0, 0)
    const endOfDay = new Date(day); endOfDay.setHours(s.businessEnd, 0, 0, 0)
    const fb = await cal.freebusy.query({ requestBody: { timeMin: startOfDay.toISOString(), timeMax: endOfDay.toISOString(), items: [{ id: calendarId }] } })
    const busy = fb.data.calendars?.[calendarId]?.busy || []
    const all = rangeTimes(startOfDay, addMinutes(endOfDay, -duration), s.slotStepMinutes)
    const minStart = new Date(Date.now() + s.minNoticeHours * 3600 * 1000)
    function overlapsBusy(slotStart: Date) {
      const slotEnd = addMinutes(slotStart, duration)
      const slotStartBuf = addMinutes(slotStart, -s.bufferMinutes)
      const slotEndBuf = addMinutes(slotEnd, s.bufferMinutes)
      return busy.some(b => {
        const bStart = new Date(b.start!); const bEnd = new Date(b.end!)
        return (slotStartBuf < bEnd) && (slotEndBuf > bStart)
      })
    }
    const available = all.filter(slt => slt >= minStart).filter(slt => !overlapsBusy(slt)).map(slt => ({ start: slt.toISOString() }))
    return NextResponse.json({ slots: available })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
