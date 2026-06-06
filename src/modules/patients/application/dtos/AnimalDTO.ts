import { z } from 'zod'

export const CreateAnimalSchema = z.object({
  tutorId: z.string().uuid('Tutor inválido'),
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER']),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).default('UNKNOWN'),
  birthDate: z.string().optional(),
  weightKg: z.number().positive('Peso deve ser positivo').optional(),
  color: z.string().optional(),
  castrated: z.boolean().default(false),
  microchip: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateAnimalSchema = CreateAnimalSchema.omit({ tutorId: true }).partial()

export type CreateAnimalInput = z.infer<typeof CreateAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof UpdateAnimalSchema>

export const SPECIES_LABELS: Record<string, string> = {
  DOG: 'Cão',
  CAT: 'Gato',
  BIRD: 'Pássaro',
  RABBIT: 'Coelho',
  REPTILE: 'Réptil',
  OTHER: 'Outro',
}

export const SEX_LABELS: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
  UNKNOWN: 'Não informado',
}
