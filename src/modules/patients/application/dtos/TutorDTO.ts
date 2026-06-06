import { z } from 'zod'

export const CreateTutorSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  cpf: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateTutorSchema = CreateTutorSchema.partial()

export type CreateTutorInput = z.infer<typeof CreateTutorSchema>
export type UpdateTutorInput = z.infer<typeof UpdateTutorSchema>

export interface TutorResponseDTO {
  id: string
  name: string
  cpf?: string
  phone: string
  whatsapp?: string
  email?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  notes?: string
  status: string
  animalsCount?: number
  createdAt: string
  updatedAt: string
}
