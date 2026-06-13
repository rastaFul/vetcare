import { format, addHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { prisma } from '@/lib/prisma'
import { SendNotification } from '@/modules/notifications/application/use-cases/SendNotification'
import { SendSessionNotification } from '@/modules/notifications/application/use-cases/SendSessionNotification'
import { PrismaNotificationLogRepository } from '@/modules/notifications/infrastructure/repositories/PrismaNotificationLogRepository'
import { EvolutionApiAdapter } from '@/modules/notifications/infrastructure/whatsapp/EvolutionApiAdapter'
import { ResendAdapter } from '@/modules/notifications/infrastructure/email/ResendAdapter'
import { INotificationService } from '@/modules/notifications/application/ports/INotificationService'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runNotificationCron(): Promise<void> {
  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
  })

  for (const tenant of tenants) {
    const now = new Date()

    const whatsappAdapter: INotificationService | null =
      tenant.evolutionApiUrl && tenant.evolutionApiKey && tenant.evolutionInstanceName
        ? new EvolutionApiAdapter(
            tenant.evolutionApiUrl,
            tenant.evolutionApiKey,
            tenant.evolutionInstanceName,
          )
        : null

    const emailAdapter: INotificationService | null =
      tenant.resendApiKey && tenant.resendFromEmail
        ? new ResendAdapter(tenant.resendApiKey, tenant.resendFromEmail)
        : null

    const logRepo = new PrismaNotificationLogRepository()
    const useCase = new SendNotification(logRepo, whatsappAdapter, emailAdapter)
    const sessionUseCase = new SendSessionNotification(logRepo, whatsappAdapter, emailAdapter)

    // Consultations: next 24h (±1h tolerance: 23h–25h window)
    const consultStart = addHours(now, 23)
    const consultEnd = addHours(now, 25)

    const consultations = await prisma.consultation.findMany({
      where: {
        tenantId: tenant.id,
        status: 'SCHEDULED',
        scheduledAt: { gte: consultStart, lte: consultEnd },
      },
      include: {
        animal: { include: { tutor: true } },
        veterinarian: true,
      },
    })

    // Vaccinations: next 7 days (±12h tolerance: 156h–180h window)
    const vaccStart = addHours(now, 156)
    const vaccEnd = addHours(now, 180)

    const vaccinations = await prisma.vaccinationRecord.findMany({
      where: {
        tenantId: tenant.id,
        nextDoseAt: { gte: vaccStart, lte: vaccEnd },
      },
      include: { animal: { include: { tutor: true } } },
    })

    // Returns: next 3 days (±12h tolerance: 60h–84h window)
    const returnStart = addHours(now, 60)
    const returnEnd = addHours(now, 84)

    const returns = await prisma.consultation.findMany({
      where: {
        tenantId: tenant.id,
        status: { not: 'CANCELLED' },
        returnDate: { gte: returnStart, lte: returnEnd },
      },
      include: {
        animal: { include: { tutor: true } },
        veterinarian: true,
      },
    })

    // Sessions: next 24h (±1h tolerance: 23h–25h window)
    const sessions = await prisma.appSession.findMany({
      where: {
        tenantId: tenant.id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: consultStart, lte: consultEnd },
      },
      include: {
        client: true,
        service: true,
        therapist: true,
      },
    })

    // Session returns: next 3 days
    const sessionReturns = await prisma.appSession.findMany({
      where: {
        tenantId: tenant.id,
        status: { not: 'CANCELLED' },
        returnDate: { gte: returnStart, lte: returnEnd },
      },
      include: {
        client: true,
        service: true,
        therapist: true,
      },
    })

    console.log(
      `[Cron] Processing tenant ${tenant.id}: ${consultations.length} consultations, ${vaccinations.length} vaccinations, ${returns.length} returns, ${sessions.length} sessions`,
    )

    // Send consultation reminders
    for (const consultation of consultations) {
      const { animal, veterinarian } = consultation
      const tutor = animal.tutor

      const address =
        consultation.street
          ? `${consultation.street}, ${consultation.number ?? ''} - ${consultation.neighborhood ?? ''}, ${consultation.city ?? ''}`.trim()
          : undefined

      await useCase.execute({
        tenantId: tenant.id,
        tutorId: tutor.id,
        animalId: animal.id,
        type: 'CONSULTATION_REMINDER',
        vars: {
          date: format(consultation.scheduledAt, 'dd/MM/yyyy', { locale: ptBR }),
          time: format(consultation.scheduledAt, 'HH:mm'),
          address,
          vetName: veterinarian.name ?? 'Dra.',
        },
        referenceId: consultation.id,
      })

      await sleep(1000)
    }

    // Send vaccination reminders
    for (const vaccination of vaccinations) {
      const { animal } = vaccination
      const tutor = animal.tutor

      if (!vaccination.nextDoseAt) continue

      await useCase.execute({
        tenantId: tenant.id,
        tutorId: tutor.id,
        animalId: animal.id,
        type: 'VACCINATION_REMINDER',
        vars: {
          date: format(vaccination.nextDoseAt, 'dd/MM/yyyy', { locale: ptBR }),
          vaccine: vaccination.vaccine,
          vetName: tenant.name ?? 'Dra.',
        },
        referenceId: vaccination.id,
      })

      await sleep(1000)
    }

    // Send return reminders
    for (const consultation of returns) {
      const { animal, veterinarian } = consultation
      const tutor = animal.tutor

      if (!consultation.returnDate) continue

      await useCase.execute({
        tenantId: tenant.id,
        tutorId: tutor.id,
        animalId: animal.id,
        type: 'RETURN_REMINDER',
        vars: {
          date: format(consultation.returnDate, 'dd/MM/yyyy', { locale: ptBR }),
          vetName: veterinarian.name ?? 'Dra.',
        },
        referenceId: consultation.id,
      })

      await sleep(1000)
    }

    // Send session reminders
    for (const session of sessions) {
      const address = session.street
        ? `${session.street}, ${session.number ?? ''} - ${session.neighborhood ?? ''}, ${session.city ?? ''}`.trim()
        : undefined

      await sessionUseCase.execute({
        tenantId: tenant.id,
        clientId: session.client.id,
        sessionId: session.id,
        type: 'SESSION_REMINDER',
        scheduledAt: session.scheduledAt,
        serviceName: session.service?.name ?? 'Sessão',
        therapistName: session.therapist.name ?? 'Terapeuta',
        tenantName: tenant.name,
        address,
      })

      await sleep(1000)
    }

    // Send session return reminders
    for (const session of sessionReturns) {
      if (!session.returnDate) continue

      await sessionUseCase.execute({
        tenantId: tenant.id,
        clientId: session.client.id,
        sessionId: session.id,
        type: 'SESSION_RETURN_REMINDER',
        scheduledAt: session.scheduledAt,
        returnDate: session.returnDate,
        serviceName: session.service?.name ?? 'Sessão',
        therapistName: session.therapist.name ?? 'Terapeuta',
        tenantName: tenant.name,
      })

      await sleep(1000)
    }
  }
}
