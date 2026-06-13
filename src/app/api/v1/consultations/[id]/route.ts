import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaConsultationRepository } from '@/modules/clinical/infrastructure/repositories/PrismaConsultationRepository'
import { GoogleCalendarServiceAccountAdapter } from '@/modules/clinical/infrastructure/calendar/GoogleCalendarServiceAccountAdapter'
import { GetConsultation } from '@/modules/clinical/application/use-cases/GetConsultation'
import { RescheduleConsultation } from '@/modules/clinical/application/use-cases/RescheduleConsultation'
import { UpdateConsultationSchema } from '@/modules/clinical/application/dtos/ConsultationDTO'
import { Consultation } from '@/modules/clinical/domain/entities/Consultation'
import { prisma } from '@/lib/prisma'

const consultationRepo = new PrismaConsultationRepository()
const calendarService = new GoogleCalendarServiceAccountAdapter()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params

    const useCase = new GetConsultation(consultationRepo)
    const consultation = await useCase.execute(id, session.tenantId)

    // Fetch related data
    const raw = await prisma.consultation.findFirst({
      where: { id, tenantId: session.tenantId },
      include: {
        animal: { include: { tutor: true } },
        veterinarian: true,
        prescriptions: { include: { items: true } },
        attachments: true,
      },
    })

    return apiSuccess({
      ...consultationToDTO(consultation),
      animal: raw?.animal
        ? {
            id: raw.animal.id,
            name: raw.animal.name,
            species: raw.animal.species,
            tutor: raw.animal.tutor
              ? {
                  id: raw.animal.tutor.id,
                  name: raw.animal.tutor.name,
                  phone: raw.animal.tutor.phone,
                }
              : null,
          }
        : null,
      veterinarian: raw?.veterinarian
        ? { id: raw.veterinarian.id, name: raw.veterinarian.name }
        : null,
      prescriptions: raw?.prescriptions ?? [],
      attachments: raw?.attachments ?? [],
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const input = UpdateConsultationSchema.parse(body)

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { googleCalendarId: true },
    })
    const calendarId = tenant?.googleCalendarId ?? undefined

    const useCase = new RescheduleConsultation(consultationRepo, calendarService)
    await useCase.execute(id, session.tenantId, input, calendarId)

    const getUseCase = new GetConsultation(consultationRepo)
    const consultation = await getUseCase.execute(id, session.tenantId)

    return apiSuccess(consultationToDTO(consultation))
  } catch (e) {
    return apiError(e)
  }
}

function consultationToDTO(consultation: Consultation) {
  return {
    id: consultation.id,
    animalId: consultation.animalId,
    veterinarianId: consultation.veterinarianId,
    scheduledAt: consultation.scheduledAt.toISOString(),
    address: consultation.address,
    status: consultation.status,
    googleCalendarEventId: consultation.googleCalendarEventId,
    anamnesis: consultation.anamnesis,
    diagnosis: consultation.diagnosis,
    observations: consultation.observations,
    returnDate: consultation.returnDate?.toISOString(),
    returnEventId: consultation.returnEventId,
    createdAt: consultation.createdAt.toISOString(),
    updatedAt: consultation.updatedAt.toISOString(),
  }
}
