import { z } from 'zod'

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const UploadAttachmentSchema = z.object({
  animalId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  type: z
    .enum(['EXAM', 'PHOTO', 'REPORT', 'EXTERNAL_PRESCRIPTION', 'OTHER'])
    .default('OTHER'),
})

export type UploadAttachmentInput = z.infer<typeof UploadAttachmentSchema>

export const ATTACHMENT_TYPE_LABELS: Record<string, string> = {
  EXAM: 'Exame',
  PHOTO: 'Foto',
  REPORT: 'Laudo',
  EXTERNAL_PRESCRIPTION: 'Receita Externa',
  OTHER: 'Outro',
}
