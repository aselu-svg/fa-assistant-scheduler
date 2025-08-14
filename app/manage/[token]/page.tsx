'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { formatLocal } from '@/lib/tz'
const fetcher = (u: string) => fetch(u).then(r => r.json())

export default function Manage({ params }: { params: { token: string } }) {
  const { token } = params
  const { data } = useSWR(`/api/manage?token=${token}`, fetcher)
  const [status, setStatus] = useState('')
  async function cancel() {
    setStatus('Cancelling...')
    const res = await fetch('/api/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'cancel' }) })
    const d = await res.json()
    setStatus(d.error ? 'Error: ' + d.error : 'Cancelled.')
  }
  return (
    <div className="space-y-4">
      <h1>Manage Booking</h1>
      {!data && <p>Loading...</p>}
      {data?.error && <p className="text-red-600">{data.error}</p>}
      {data?.booking && (
        <div className="card space-y-2">
          <p><strong>{data.booking.meetingType.title}</strong></p>
          <p>{formatLocal(data.booking.start)}</p>
          {data.booking.zoomJoinUrl && <p className="text-sm">Zoom: <a className="underline" href={data.booking.zoomJoinUrl}>{data.booking.zoomJoinUrl}</a></p>}
          <div className="flex gap-2"><button className="btn" onClick={cancel}>Cancel</button></div>
          {status && <p className="text-sm">{status}</p>}
        </div>
      )}
    </div>
  )
}
