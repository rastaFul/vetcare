import { NextResponse } from 'next/server'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()
    const { tenantId } = session

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const [
      consultationsToday,
      pendingReturns,
      upcomingVaccinations,
      totalAnimals,
      totalTutors,
      consultationsThisMonth,
    ] = await Promise.all([
      prisma.consultation.findMany({
        where: {
          tenantId,
          scheduledAt: { gte: todayStart, lte: todayEnd },
          status: { notIn: ['CANCELLED'] },
        },
        include: {
          animal: { select: { id: true, name: true, species: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.consultation.findMany({
        where: {
          tenantId,
          returnDate: { gte: now, lte: in7Days },
          status: 'COMPLETED',
        },
        include: {
          animal: { select: { id: true, name: true } },
        },
        orderBy: { returnDate: 'asc' },
      }),
      prisma.vaccinationRecord.findMany({
        where: {
          tenantId,
          nextDoseAt: { gte: now, lte: in30Days },
        },
        include: {
          animal: { select: { id: true, name: true } },
        },
        orderBy: { nextDoseAt: 'asc' },
      }),
      prisma.animal.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.tutor.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.consultation.count({
        where: {
          tenantId,
          scheduledAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: todayEnd,
          },
          status: { notIn: ['CANCELLED'] },
        },
      }),
    ])

    return NextResponse.json({
      data: {
        consultationsToday: consultationsToday.map((c) => ({
          id: c.id,
          scheduledAt: c.scheduledAt.toISOString(),
          status: c.status,
          animal: c.animal,
          address: c.city ? `${c.city}` : undefined,
        })),
        pendingReturns: pendingReturns.map((c) => ({
          id: c.id,
          returnDate: c.returnDate?.toISOString(),
          animal: c.animal,
        })),
        upcomingVaccinations: upcomingVaccinations.map((v) => ({
          id: v.id,
          vaccine: v.vaccine,
          nextDoseAt: v.nextDoseAt?.toISOString(),
          animal: v.animal,
        })),
        totals: {
          animals: totalAnimals,
          tutors: totalTutors,
          consultationsThisMonth,
        },
      },
    })
  } catch (e) {
    console.error('Dashboard error:', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro ao carregar dashboard' } },
      { status: 500 }
    )
  }
}
