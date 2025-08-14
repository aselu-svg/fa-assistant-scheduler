'use client'
import { useCallback, useEffect, useState } from 'react'
import Tesseract from 'tesseract.js'
import VoiceInput from '@/components/VoiceInput'

function parseFields(text: string) {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  const cleaned = text.replace(/[\s\-\.\(\)]/g, '')
  const phoneMatch = cleaned.match(/(\+?1)?\d{10,11}/)
  const lines = text.split(/\n|\r/).map(l => l.trim()).filter(Boolean)
  const nameCandidate = lines.find(l => !l.toLowerCase().includes('email') && !l.includes('@') && !l.toLowerCase().startsWith('www'))
  const name = nameCandidate || ''
  const email = emailMatch ? emailMatch[0] : ''
  let phone = ''
  if (phoneMatch) {
    let p = phoneMatch[0]; if (p.startsWith('1') && p.length === 11) p = p.slice(1)
    if (p.length >= 10) phone = `(${p.slice(0,3)}) ${p.slice(3,6)}-${p.slice(6,10)}`
  }
  return { name, email, phone }
}

export default function NewContact() {
  const [img, setImg] = useState<string>('')
  const [ocrText, setOcrText] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search)
    const qName = qp.get('name') || ''; const qEmail = qp.get('email') || ''; const qNotes = qp.get('notes') || ''
    if (qName) setName(qName); if (qEmail) setEmail(qEmail); if (qNotes) setNotes(qNotes)
  }, [])

  const onFile = async (f: File) => {
    const url = URL.createObjectURL(f); setImg(url); setOcrText(''); setBusy(true)
    try {
      const { data } = await Tesseract.recognize(url, 'eng')
      const text = data.text || ''; setOcrText(text)
      const parsed = parseFields(text); if (parsed.name) setName(parsed.name); if (parsed.email) setEmail(parsed.email); if (parsed.phone) setPhone(parsed.phone)
    } catch (e: any) { setStatus('OCR failed: ' + e.message) } finally { setBusy(false) }
  }

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f) }, [])

  async function save() {
    setStatus('Saving...')
    const res = await fetch('/api/contacts/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, notes }) })
    const d = await res.json(); setStatus(d.error ? 'Error: ' + d.error : 'Saved.')
  }

  return (
    <div className="space-y-6">
      <h1>New Contact (Scan a Business Card)</h1>
      <div className="card space-y-3">
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="p-6 border-2 border-dashed rounded-xl text-center">
          <p className="mb-2">Drag a photo of the card here, or</p>
          <input type="file" accept="image/*" capture="environment" onChange={e => e.target.files && onFile(e.target.files[0])} />
        </div>
        {img && <img src={img} alt="preview" className="rounded-xl max-h-64 object-contain" />}
        {busy && <p>Reading card…</p>}
        {ocrText && (<details className="text-xs"><summary>Show OCR text</summary><pre className="bg-gray-50 p-2 rounded-xl whitespace-pre-wrap">{ocrText}</pre></details>)}
      </div>

      <div className="card space-y-3">
        <div><label className="label">Name</label><div className="flex gap-2"><input className="input flex-1" value={name} onChange={e => setName(e.target.value)} /><VoiceInput onText={t => setName((p) => (p ? p + ' ' : '') + t)} label="🎤 Name" /></div></div>
        <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label className="label">Phone</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" /></div>
        <div><label className="label">Notes</label><div className="flex gap-2"><textarea className="input flex-1" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Prospect, referred by… goals…"></textarea><VoiceInput onText={t => setNotes((p) => (p ? p + ' ' : '') + t)} label="🎤 Notes" /></div></div>
        <div className="flex gap-2"><button className="btn btn-primary" onClick={save} disabled={!email && !name}>Save Contact</button>{status && <p className="text-sm">{status}</p>}</div>
      </div>
    </div>
  )
}
