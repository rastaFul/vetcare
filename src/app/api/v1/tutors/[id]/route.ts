import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaTutorRepository } from '@/modules/patients/infrastructure/repositories/PrismaTutorRepository'
import { GetTutor } from '@/modules/patients/application/use-cases/GetTutor'
import { UpdateTutor } from '@/modules/patients/application/use-cases/UpdateTutor'
import { DeactivateTutor } from '@/modules/patients/application/use-cases/DeactivateTutor'
import { UpdateTutorSchema } from '@/modules/patients/application/dtos/TutorDTO'
import { Tutor } from '@/modules/patients/domain/entities/Tutor'
import { prisma } from '@/lib/prisma'

const repo = new PrismaTutorRepository()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params

    const useCase = new GetTutor(repo)
    const tutor = await useCase.execute(id, session.tenantId)

    // Fetch animals for this tutor
    const animals = await prisma.animal.findMany({
      where: { tutorId: id, tenantId: session.tenantId },
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        status: true,
      },
      orderBy: { name: 'asc' },
    })

    return apiSuccess({
      ...tutorToDTO(tutor),
      animals,
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
    const input = UpdateTutorSchema.parse(body)

    const useCase = new UpdateTutor(repo)
    await useCase.execute(id, session.tenantId, input)

    const getTutor = new GetTutor(repo)
    const updated = await getTutor.execute(id, session.tenantId)

    return apiSuccess(tutorToDTO(updated))
  } catch (e) {
    return apiError(e)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()

    if (body.status === 'INACTIVE') {
      const useCase = new DeactivateTutor(repo)
      await useCase.execute(id, session.tenantId)
    }

    const getTutor = new GetTutor(repo)
    const updated = await getTutor.execute(id, session.tenantId)

    return apiSuccess(tutorToDTO(updated))
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
