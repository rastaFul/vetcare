import { z } from 'zod'

export const ScheduleSessionSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
  createCalendarEvent: z.boolean().default(true),
})

export type ScheduleSessionInput = z.infer<typeof ScheduleSessionSchema>
