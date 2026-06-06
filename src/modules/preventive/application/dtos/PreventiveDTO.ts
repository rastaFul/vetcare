import { z } from 'zod'

export const ApplyVaccinationSchema = z.object({
  animalId: z.string().uuid(),
  vaccine: z.string().min(1),
  appliedAt: z.string(),
  nextDoseAt: z.string().optional(),
  batchNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  observations: z.string().optional(),
  createReminder: z.boolean().default(false),
})

export const ApplyDewormingSchema = z.object({
  animalId: z.string().uuid(),
  medication: z.string().min(1),
  appliedAt: z.string(),
  nextApplicationAt: z.string().optional(),
  observations: z.string().optional(),
  createReminder: z.boolean().default(false),
})

export const ApplyAntiFleasSchema = ApplyDewormingSchema

export type ApplyVaccinationInput = z.infer<typeof ApplyVaccinationSchema>
export type ApplyDewormingInput = z.infer<typeof ApplyDewormingSchema>
export type ApplyAntiFleasInput = z.infer<typeof ApplyDewormingSchema>

export const COMMON_VACCINES = [
  'V8', 'V10', 'Antirrábica', 'Giardia', 'Leishmania',
  'Tríplice Felina', 'Quádrupla Felina', 'Leucemia Felina',
]

export const COMMON_DEWORMINGS = [
  'Drontal Plus', 'Endal Plus', 'Milbemax', 'Panacur', 'Vermivet',
]

export const COMMON_ANTI_FLEAS = [
  'Frontline', 'Advantage', 'Revolution', 'NexGard', 'Bravecto', 'Simparica',
]
