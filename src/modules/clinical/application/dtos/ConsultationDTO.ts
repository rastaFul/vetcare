import { z } from 'zod'

export const ScheduleConsultationSchema = z.object({
  animalId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional(),
  createCalendarEvent: z.boolean().default(true),
})

export const CompleteConsultationSchema = z.object({
  anamnesis: z.string().min(1, 'Anamnese é obrigatória'),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  observations: z.string().optional(),
  returnDate: z.string().optional(),
  createReturnReminder: z.boolean().default(false),
})

export const UpdateConsultationSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional(),
})

export type ScheduleConsultationInput = z.infer<typeof ScheduleConsultationSchema>
export type CompleteConsultationInput = z.infer<typeof CompleteConsultationSchema>
export type UpdateConsultationInput = z.infer<typeof UpdateConsultationSchema>
