import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug') || ''
  const mt = await prisma.meetingType.findUnique({ where: { slug } })
  if (!mt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mt)
}
