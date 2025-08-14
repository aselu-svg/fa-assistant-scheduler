import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const intro = await prisma.meetingType.upsert({
    where: { slug: 'intro-30' },
    update: {},
    create: { slug: 'intro-30', title: 'Intro Call (30 min)', description: 'Quick introduction to see if we are a fit', durationMinutes: 30 }
  })
  const review = await prisma.meetingType.upsert({
    where: { slug: 'review-60' },
    update: {},
    create: { slug: 'review-60', title: 'Client Review (60 min)', description: 'Deeper review for existing clients', durationMinutes: 60 }
  })
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) { console.warn('Set OWNER_EMAIL in .env before seeding.'); return }
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: 'owner' },
    create: { email: ownerEmail, role: 'owner', name: 'Owner' }
  })
  await prisma.settings.upsert({
    where: { userId: owner.id },
    update: {},
    create: { userId: owner.id, calendarId: 'primary', businessStart: 9, businessEnd: 17, slotStepMinutes: 30, minNoticeHours: 24, bufferMinutes: 10 }
  })
  console.log('Seeded meeting types:', intro.slug, review.slug, 'for owner', owner.email)
}
main().finally(() => prisma.$disconnect())
