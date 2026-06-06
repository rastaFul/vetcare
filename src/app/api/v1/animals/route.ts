import { NextRequest } from 'next/server'
import { apiSuccess, apiList, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { PrismaTutorRepository } from '@/modules/patients/infrastructure/repositories/PrismaTutorRepository'
import { RegisterAnimal } from '@/modules/patients/application/use-cases/RegisterAnimal'
import { ListAnimals } from '@/modules/patients/application/use-cases/ListAnimals'
import { CreateAnimalSchema } from '@/modules/patients/application/dtos/AnimalDTO'
import { Animal } from '@/modules/patients/domain/entities/Animal'

const animalRepo = new PrismaAnimalRepository()
const tutorRepo = new PrismaTutorRepository()

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const { searchParams } = new URL(req.url)

    const useCase = new ListAnimals(animalRepo)
    const result = await useCase.execute({
      tenantId: session.tenantId,
      tutorId: searchParams.get('tutorId') ?? undefined,
      species: searchParams.get('species') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      pageSize: Number(searchParams.get('pageSize') ?? 20),
    })

    return apiList(result.animals.map(animalToDTO), {
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
    const input = CreateAnimalSchema.parse(body)

    const useCase = new RegisterAnimal(animalRepo, tutorRepo)
    const animal = await useCase.execute(session.tenantId, input)

    return apiSuccess(animalToDTO(animal), 201)
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
