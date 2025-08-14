import '../styles/globals.css'
import Link from 'next/link'
import Providers from './providers'

export const metadata = { title: 'Advisor Assistant Scheduler', description: 'Book time with an advisor' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b bg-white">
            <div className="container flex items-center justify-between py-4">
              <Link href="/" className="font-semibold">Advisor Assistant</Link>
              <nav className="flex gap-4 text-sm">
                <Link href="/book/intro-30" className="hover:underline">Book Intro</Link>
                <Link href="/book/review-60" className="hover:underline">Book Review</Link>
                <Link href="/contacts/new" className="hover:underline">New Contact</Link>
                <Link href="/admin" className="hover:underline">Admin</Link>
              </nav>
            </div>
          </header>
          <main className="container py-8">{children}</main>
          <footer className="border-t py-8 mt-10 text-sm text-gray-500">
            <div className="container">Built for a single-advisor workflow. Customize as you grow.</div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
