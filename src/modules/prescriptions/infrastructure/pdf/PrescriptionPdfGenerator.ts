import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { PrescriptionDocument } from './PrescriptionDocument'

interface Input {
  prescription: {
    diagnosis: string
    observations?: string
    items: Array<{
      medication: string
      dosage: string
      frequency: string
      duration: string
      instructions?: string
    }>
  }
  consultationDate: Date
  veterinarianName?: string
  veterinarianCrmv?: string
  animalName?: string
  tutorName?: string
}

export async function generatePrescriptionPdf(input: Input): Promise<Buffer> {
  const element = React.createElement(PrescriptionDocument, {
    prescription: input.prescription,
    veterinarianName: input.veterinarianName ?? 'Médico Veterinário',
    veterinarianCrmv: input.veterinarianCrmv,
    animalName: input.animalName ?? 'Animal',
    tutorName: input.tutorName ?? 'Tutor',
    consultationDate: input.consultationDate,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any)
  return Buffer.from(buffer)
}
