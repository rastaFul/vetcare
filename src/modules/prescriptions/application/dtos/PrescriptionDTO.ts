import { z } from 'zod'

export const PrescriptionItemSchema = z.object({
  medication: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
})

export const CreatePrescriptionSchema = z.object({
  consultationId: z.string().uuid(),
  diagnosis: z.string().min(1),
  observations: z.string().optional(),
  items: z.array(PrescriptionItemSchema).min(1),
})

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>
