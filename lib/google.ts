import { google } from 'googleapis'
import { prisma } from './prisma'

export async function getGoogleClientForOwner() {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) throw new Error('OWNER_EMAIL not set')
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail }, include: { accounts: true } })
  if (!owner) throw new Error('Owner user not found; run seed.')
  const googleAccount = owner.accounts.find(a => a.provider === 'google')
  if (!googleAccount?.refresh_token) throw new Error('Google not connected or missing refresh token. Sign in at /admin.')

  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  oauth2.setCredentials({ refresh_token: googleAccount.refresh_token })
  const { credentials } = await oauth2.refreshAccessToken()
  oauth2.setCredentials(credentials)
  return oauth2
}

export async function getCalendarClient() {
  const auth = await getGoogleClientForOwner()
  return google.calendar({ version: 'v3', auth })
}
