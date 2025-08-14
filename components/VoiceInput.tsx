'use client'
import { useEffect, useRef, useState } from 'react'
type Props = { onText: (text: string) => void, interim?: boolean, lang?: string, className?: string, label?: string }
export default function VoiceInput({ onText, interim=false, lang='en-US', className='', label='Speak' }: Props) {
  const [listening, setListening] = useState(false); const recognitionRef = useRef<any>(null)
  useEffect(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) return
    const r = new SR(); r.continuous = true; r.interimResults = interim; r.lang = lang
    r.onresult = (e: any) => { let finalText = ''; for (let i=e.resultIndex; i<e.results.length; i++){ const res=e.results[i]; if (res.isFinal) finalText += res[0].transcript } if (finalText) onText(finalText.trim()) }
    r.onend = () => setListening(false); recognitionRef.current = r; return () => { try { r.stop() } catch {} }
  }, [interim, lang, onText])
  function toggle() {
    const r = recognitionRef.current; if (!r) { alert('Voice input not supported in this browser. Try Chrome.'); return }
    if (listening) { r.stop(); setListening(false) } else { setListening(true); r.start() }
  }
  return (<button type="button" onClick={toggle} className={`btn ${className}`}>{listening ? 'Stop' : label}</button>)
}
