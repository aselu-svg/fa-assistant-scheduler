'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (u: string) => fetch(u).then(r => r.json())

export default function Admin() {
  const { data: session } = useSession()
  const { data: settings, mutate } = useSWR(session ? '/api/settings' : null, fetcher)
  const { data: upcoming } = useSWR(session ? '/api/availability?adminUpcoming=1' : null, fetcher)
  const [local, setLocal] = useState<any>(null)

  function onEdit() { setLocal(settings) }
  async function onSave() {
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(local) })
    if (res.ok) { setLocal(null); mutate() }
  }

  return (
    <div className="space-y-6">
      <h1>Admin</h1>
      {!session && (
        <div className="card space-y-3">
          <p>Sign in with Google to connect your calendar.</p>
          <button className="btn btn-primary" onClick={() => signIn('google')}>Sign in with Google</button>
        </div>
      )}
      {session && (
        <div className="space-y-6">
          <div className="card flex items-center justify-between">
            <div>
              <p className="font-medium">Signed in as {session.user?.email}</p>
              <small className="mono">OWNER_EMAIL should match this Google user.</small>
            </div>
            <button className="btn" onClick={() => signOut()}>Sign out</button>
          </div>
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2>Settings</h2>
              {!local ? <button className="btn" onClick={onEdit}>Edit</button> : (
                <div className="flex gap-2">
                  <button className="btn" onClick={() => setLocal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={onSave}>Save</button>
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {['calendarId','businessStart','businessEnd','slotStepMinutes','minNoticeHours','bufferMinutes'].map((k) => (
                <div key={k}>
                  <label className="label">{k}</label>
                  {!local ? (
                    <div className="p-2 rounded-xl bg-gray-50 text-sm">{settings?.[k]}</div>
                  ) : (
                    <input className="input" value={local[k]} onChange={e => setLocal({ ...local, [k]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="card space-y-2">
            <h2>Upcoming (7 days)</h2>
            <pre className="bg-gray-50 p-3 rounded-xl overflow-auto text-xs">{JSON.stringify(upcoming, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
