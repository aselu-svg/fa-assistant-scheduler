import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/google'
import { prisma } from '@/lib/prisma'
import { addMinutes } from '@/lib/tz'
import { createZoomMeeting } from '@/lib/zoom'
import { sendEmail } from '@/lib/email'

type Body = { meetingSlug: string, start: string, name: string, email: string, notes?: string }

export async function POST(req: NextRequest) {
  const body = await req.json() as Body
  try {
    if (!body.start || !body.email || !body.name) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const meetingType = await prisma.meetingType.findUnique({ where: { slug: body.meetingSlug } })
    if (!meetingType) return NextResponse.json({ error: 'Unknown meeting type' }, { status: 400 })
    const ownerEmail = process.env.OWNER_EMAIL; if (!ownerEmail) throw new Error('OWNER_EMAIL not set')
    const duration = meetingType.durationMinutes
    const start = new Date(body.start); const end = addMinutes(start, duration)
    const cal = await getCalendarClient()
    const owner = await prisma.user.findUnique({ where: { email: ownerEmail! } })
    if (!owner) throw new Error('Owner not found')
    const settings = await prisma.settings.findUnique({ where: { userId: owner.id } })
    const calendarId = settings?.calendarId || 'primary'
    const contact = await prisma.contact.upsert({
      where: { email_userId: { email: body.email, userId: owner.id } },
      update: { name: body.name, notes: body.notes },
      create: { userId: owner.id, name: body.name, email: body.email, notes: body.notes || '' }
    })
    let zoomJoinUrl: string | undefined = undefined
    try { const zm = await createZoomMeeting(meetingType.title, start.toISOString(), duration); if (zm?.join_url) zoomJoinUrl = zm.join_url } catch {}
    const description = `Booked via Assistant\n\nNotes:\n${body.notes || ''}\n\n` + (zoomJoinUrl ? `Zoom: ${zoomJoinUrl}` : 'Video: Google Meet link attached')
    const requestBody: any = {
      summary: `${meetingType.title}: ${body.name}`,
      description,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: [{ email: body.email, responseStatus: 'needsAction' }],
    }
    if (!zoomJoinUrl) requestBody.conferenceData = { createRequest: { requestId: 'book-' + Date.now() } }
    const event = await cal.events.insert({ calendarId, conferenceDataVersion: 1, requestBody })
    const booking = await prisma.booking.create({
      data: { userId: owner.id, meetingTypeId: meetingType.id, contactId: contact.id, start, end, googleEventId: event.data.id || undefined, status: 'confirmed', zoomJoinUrl }
    })
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const manageUrl = `${baseUrl}/manage/${booking.token}`
    const txt = [
      `Hi ${body.name},`,
      ``,
      `Your ${meetingType.title} is confirmed:`,
      `${start.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}`,
      ``,
      zoomJoinUrl ? `Zoom: ${zoomJoinUrl}` : `A Google Meet link is attached to the calendar invite.`,
      ``,
      `Need to make changes? Manage your booking here: ${manageUrl}`,
      ``,
      `— Advisor Assistant`
    ].join('\n')
    await sendEmail(body.email, `Confirmed: ${meetingType.title}`, txt)
    return NextResponse.json({ ok: true, bookingId: booking.id, token: booking.token, eventId: event.data.id })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
