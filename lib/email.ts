import nodemailer from 'nodemailer'

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT || 587)
  const from = process.env.FROM_EMAIL || 'no-reply@example.com'
  if (!host || !user || !pass) { console.warn('SMTP not configured; skipping email to', to); return }
  const transporter = nodemailer.createTransport({ host, port, auth: { user, pass }, secure: false })
  await transporter.sendMail({ from, to, subject, text, html })
}
