import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { GetAnimal } from '@/modules/patients/application/use-cases/GetAnimal'
import { UpdateAnimal } from '@/modules/patients/application/use-cases/UpdateAnimal'
import { ChangeAnimalStatus } from '@/modules/patients/application/use-cases/ChangeAnimalStatus'
import { UpdateAnimalSchema } from '@/modules/patients/application/dtos/AnimalDTO'
import { Animal, AnimalStatus } from '@/modules/patients/domain/entities/Animal'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const animalRepo = new PrismaAnimalRepository()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params

    const useCase = new GetAnimal(animalRepo)
    const animal = await useCase.execute(id, session.tenantId)

    // Fetch tutor details
    const tutor = await prisma.tutor.findFirst({
      where: { id: animal.tutorId, tenantId: session.tenantId },
      select: { id: true, name: true, phone: true, email: true },
    })

    return apiSuccess({
      ...animalToDTO(animal),
      tutor,
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
    const input = UpdateAnimalSchema.parse(body)

    const useCase = new UpdateAnimal(animalRepo)
    await useCase.execute(id, session.tenantId, input)

    const getUseCase = new GetAnimal(animalRepo)
    const updated = await getUseCase.execute(id, session.tenantId)

    return apiSuccess(animalToDTO(updated))
  } catch (e) {
    return apiError(e)
  }
}

const StatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DECEASED', 'INACTIVE']),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const { status } = StatusSchema.parse(body)

    const useCase = new ChangeAnimalStatus(animalRepo)
    await useCase.execute(id, session.tenantId, status as AnimalStatus)

    const getUseCase = new GetAnimal(animalRepo)
    const updated = await getUseCase.execute(id, session.tenantId)

    return apiSuccess(animalToDTO(updated))
  } catch (e) {
    return apiError(e)
  }
}

function animalToDTO(animal: Animal) {
  return {
    id: animal.id,
    tenantId: animal.tenantId,
    tutorId: animal.tutorId,
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    sex: animal.sex,
    birthDate: animal.birthDate?.toISOString(),
    ageInYears: animal.ageInYears,
    weightKg: animal.weightKg,
    color: animal.color,
    castrated: animal.castrated,
    microchip: animal.microchip,
    photoUrl: animal.photoUrl,
    notes: animal.notes,
    status: animal.status,
    isActive: animal.isActive,
    createdAt: animal.createdAt.toISOString(),
    updatedAt: animal.updatedAt.toISOString(),
  }
}
