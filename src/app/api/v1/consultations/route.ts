import { NextRequest } from 'next/server'
import { apiSuccess, apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaConsultationRepository } from '@/modules/clinical/infrastructure/repositories/PrismaConsultationRepository'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { GoogleCalendarAdapter } from '@/modules/clinical/infrastructure/calendar/GoogleCalendarAdapter'
import { ScheduleConsultation } from '@/modules/clinical/application/use-cases/ScheduleConsultation'
import { ListConsultations } from '@/modules/clinical/application/use-cases/ListConsultations'
import { ScheduleConsultationSchema } from '@/modules/clinical/application/dtos/ConsultationDTO'
import { Consultation } from '@/modules/clinical/domain/entities/Consultation'
import { prisma } from '@/lib/prisma'

const consultationRepo = new PrismaConsultationRepository()
const animalRepo = new PrismaAnimalRepository()
const calendarService = new GoogleCalendarAdapter()

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const useCase = new ListConsultations(consultationRepo)
    const result = await useCase.execute({
      tenantId: session.tenantId,
      animalId: searchParams.get('animalId') ?? undefined,
      veterinarianId: searchParams.get('veterinarianId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    return apiList(result.consultations.map(consultationToDTO), {
      total: result.total,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const body = await req.json()
    const input = ScheduleConsultationSchema.parse(body)

    // Get calendar token if available
    const user = await prisma.user.findFirst({ where: { id: session.userId } })
    const calendarToken = user?.googleCalendarToken ?? undefined

    const useCase = new ScheduleConsultation(consultationRepo, animalRepo, calendarService)
    const consultation = await useCase.execute(
      session.tenantId,
      session.userId,
      input,
      calendarToken ?? undefined
    )

    return apiSuccess(consultationToDTO(consultation), 201)
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
