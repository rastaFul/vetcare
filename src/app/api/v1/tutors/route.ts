import { NextRequest } from 'next/server'
import { apiSuccess, apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaTutorRepository } from '@/modules/patients/infrastructure/repositories/PrismaTutorRepository'
import { RegisterTutor } from '@/modules/patients/application/use-cases/RegisterTutor'
import { ListTutors } from '@/modules/patients/application/use-cases/ListTutors'
import { CreateTutorSchema } from '@/modules/patients/application/dtos/TutorDTO'
import { Tutor } from '@/modules/patients/domain/entities/Tutor'

const repo = new PrismaTutorRepository()

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const useCase = new ListTutors(repo)
    const result = await useCase.execute({
      tenantId: session.tenantId,
      search: searchParams.get('search') ?? undefined,
      status: (searchParams.get('status') as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    return apiList(result.tutors.map(tutorToDTO), {
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
    const input = CreateTutorSchema.parse(body)

    const useCase = new RegisterTutor(repo)
    const tutor = await useCase.execute(session.tenantId, input)

    return apiSuccess(tutorToDTO(tutor), 201)
  } catch (e) {
    return apiError(e)
  }
}

function tutorToDTO(tutor: Tutor) {
  return {
    id: tutor.id,
    name: tutor.name,
    cpf: tutor.cpf ? tutor.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : undefined,
    phone: tutor.phone,
    whatsapp: tutor.whatsapp,
    email: tutor.email,
    address: tutor.address,
    notes: tutor.notes,
    status: tutor.status,
    createdAt: tutor.createdAt.toISOString(),
    updatedAt: tutor.updatedAt.toISOString(),
  }
}
