async function token() {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET
  if (!accountId || !clientId || !clientSecret) return null
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const resp = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}` }
  })
  if (!resp.ok) { console.warn('Zoom token error', await resp.text()); return null }
  const data = await resp.json()
  return data.access_token as string
}

export async function createZoomMeeting(topic: string, startISO: string, durationMinutes: number) {
  const t = await token()
  if (!t) return null
  const body = { topic, type: 2, start_time: startISO, duration: durationMinutes, timezone: 'UTC', settings: { waiting_room: true } }
  const resp = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!resp.ok) { console.warn('Zoom create error', await resp.text()); return null }
  const data = await resp.json()
  return { id: data.id, join_url: data.join_url } as { id: number, join_url: string }
}
