'use client'
import { useEffect, useState, useMemo } from 'react'
import { formatLocal } from '@/lib/tz'
type Slot = { start: string }

export default function Booking({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const [mt, setMt] = useState<any>(null)
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState<string>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<string>('')
  const [confirmed, setConfirmed] = useState<{ when: string, token: string } | null>(null)

  useEffect(() => { fetch('/api/meeting-type?slug=' + slug).then(r => r.json()).then(setMt) }, [slug])
  useEffect(() => {
    setStatus('')
    fetch(`/api/availability?date=${date}&meetingSlug=${slug}`).then(r => r.json()).then(d => setSlots(d.slots || [])).catch(() => setSlots([]))
  }, [date, slug])

  async function book() {
    setStatus('Booking...')
    const res = await fetch('/api/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meetingSlug: slug, start: selected, name, email, notes }) })
    const data = await res.json()
    if (res.ok) { setStatus('Confirmed!'); setConfirmed({ when: selected, token: data.token }) } else { setStatus('Error: ' + (data.error || 'unable to book')) }
  }

  const contactPrefillUrl = useMemo(() => {
    if (!confirmed) return null
    const params = new URLSearchParams({ name: name || '', email: email || '', notes: notes || `Booked ${mt?.title || 'Meeting'} on ${new Date(confirmed.when).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` })
    return `/contacts/new?${params.toString()}`
  }, [confirmed, name, email, notes, mt])

  if (confirmed) {
    return (
      <div className="space-y-6">
        <h1>{mt?.title || 'Booked'}</h1>
        <div className="card space-y-3">
          <p className="text-green-700 font-medium">Your meeting is confirmed.</p>
          <p>{formatLocal(confirmed.when)}</p>
          <div className="flex gap-2">
            <a href={`/manage/${confirmed.token}`} className="btn">Manage / Cancel</a>
            {contactPrefillUrl && <a href={contactPrefillUrl} className="btn btn-primary">Create contact from this booking</a>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1>{mt?.title || 'Book a Meeting'}</h1>
      <p className="text-gray-600">{mt?.description}</p>
      <div className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="label">Choose a date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <div className="mt-4 grid-times">
              {slots.length === 0 && <p className="text-sm text-gray-500">No times available</p>}
              {slots.map((s) => (
                <button key={s.start} onClick={() => setSelected(s.start)} className={`time-btn ${selected===s.start ? 'ring-2 ring-black' : ''}`}>
                  {new Date(s.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div><label className="label">Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div><label className="label">Notes (optional)</label><textarea className="input" rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What would you like to cover?" /></div>
            <div className="flex items-center gap-3">
              <button disabled={!selected || !name || !email} className="btn btn-primary" onClick={book}>Book</button>
              {selected && <span className="text-sm text-gray-600">Selected: {formatLocal(selected)}</span>}
            </div>
            {status && <p className="text-sm">{status}</p>}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">By booking you consent to receive emails related to this meeting.</p>
    </div>
  )
}
