# Advisor Assistant Scheduler — Complete v4

A ready-to-run scheduling assistant for a single financial advisor.

## Features
- Booking pages for multiple meeting types (intro, review)
- Availability from Google Calendar within business hours (9–5), 24h minimum notice, buffer around meetings
- Creates Google Calendar events
  - If Zoom S2S OAuth is configured, attaches a Zoom meeting
  - Else auto-generates a Google Meet link
- Admin page: edit calendarId, business hours, slot step, min notice, buffer
- Email confirmations (optional SMTP)
- Manage link to cancel
- Contacts:
  - `/contacts/new`: snap/upload a business card → OCR → prefill
  - Voice dictation via Web Speech API
  - Save to Prisma with dedupe by email
- Booking success shows **Create contact from this booking** to prefill contact form

## Quick Start
1) Create a Google OAuth Web client, add redirect:
   `http://localhost:3000/api/auth/callback/google`
2) Copy `.env.example` → `.env` and set values:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET` any random string
   - `OWNER_EMAIL` the Google calendar account receiving bookings
3) Install & DB
```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
4) Visit `http://localhost:3000/admin` and sign in with the same Google account as `OWNER_EMAIL`.

### Optional
- **Zoom**: set `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`
- **Email**: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`

MIT License
