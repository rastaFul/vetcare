import { z } from 'zod'

export const CreateClientSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  birthDate: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateClientSchema = CreateClientSchema.partial()

export type CreateClientInput = z.infer<typeof CreateClientSchema>
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>
