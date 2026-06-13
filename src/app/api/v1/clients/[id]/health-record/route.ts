import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/shared/infrastructure/api-response'
import { getAuthSession } from '@/shared/infrastructure/get-session'
import { PrismaClientRepository } from '@/modules/clients/infrastructure/repositories/PrismaClientRepository'
import { UpdateClientHealthRecord } from '@/modules/clients/application/use-cases/UpdateClientHealthRecord'
import { z } from 'zod'

const repo = new PrismaClientRepository()

const HealthRecordSchema = z.object({
  pathologies: z.string().optional(),
  contraindications: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  objectives: z.string().optional(),
  observations: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params

    const record = await repo.findHealthRecord(id, session.tenantId)
    return apiSuccess(record ?? null)
  } catch (e) {
    return apiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    const { id } = await params
    const body = await req.json()
    const input = HealthRecordSchema.parse(body)

    const useCase = new UpdateClientHealthRecord(repo)
    const record = await useCase.execute({
      tenantId: session.tenantId,
      clientId: id,
      ...input,
    })

    return apiSuccess({
      id: record.id,
      clientId: record.clientId,
      pathologies: record.pathologies,
      contraindications: record.contraindications,
      medications: record.medications,
      allergies: record.allergies,
      objectives: record.objectives,
      observations: record.observations,
      updatedAt: record.updatedAt.toISOString(),
    })
  } catch (e) {
    return apiError(e)
  }
}
