import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaAnimalRepository } from '@/modules/patients/infrastructure/repositories/PrismaAnimalRepository'
import { GetAnimal } from '@/modules/patients/application/use-cases/GetAnimal'
import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/shared/infrastructure/errors'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const animalRepo = new PrismaAnimalRepository()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params

    // Verify animal exists and belongs to tenant
    const getUseCase = new GetAnimal(animalRepo)
    await getUseCase.execute(id, session.tenantId)

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new ValidationError('Arquivo é obrigatório')
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.')
    }

    if (file.size > MAX_SIZE) {
      throw new ValidationError('Arquivo muito grande. Máximo 5MB.')
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const filename = `${id}-${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'animals')

    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const photoUrl = `/uploads/animals/${filename}`

    await prisma.animal.update({
      where: { id },
      data: { photoUrl, updatedAt: new Date() },
    })

    return apiSuccess({ photoUrl })
  } catch (e) {
    return apiError(e)
  }
}
