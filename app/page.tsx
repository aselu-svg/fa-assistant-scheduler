import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-6">
      <h1>Welcome</h1>
      <p className="text-gray-700">Share a booking link below. Intro is for prospects. Review is for active clients.</p>
      <div className="card space-y-3">
        <h2>Quick Links</h2>
        <div className="flex gap-3">
          <Link href="/book/intro-30" className="btn btn-primary">Book Intro (30)</Link>
          <Link href="/book/review-60" className="btn">Book Review (60)</Link>
          <Link href="/contacts/new" className="btn">Scan Business Card → Contact</Link>
          <Link href="/admin" className="btn">Admin</Link>
        </div>
        <p className="text-sm text-gray-500">First time? Go to Admin, sign in with Google, and check Settings.</p>
      </div>
    </div>
  )
}
