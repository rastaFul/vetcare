import { z } from 'zod'

export const CreateServiceSchema = z.object({
  name: z.string().min(2).max(100),
  durationMin: z.number().int().min(15).max(480),
  price: z.number().min(0),
  description: z.string().optional(),
})

export const UpdateServiceSchema = CreateServiceSchema.partial()

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>
