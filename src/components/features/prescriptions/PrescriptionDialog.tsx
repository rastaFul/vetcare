'use client'

import { useState } from 'react'
import { PrescriptionForm } from './PrescriptionForm'
import { CreatePrescriptionInput } from '@/modules/prescriptions/application/dtos/PrescriptionDTO'

interface Props {
  consultationId: string
  onCreated: (prescription: unknown) => void
}

export function PrescriptionDialog({ consultationId, onCreated }: Props) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: CreatePrescriptionInput) {
    const res = await fetch(`/api/v1/consultations/${consultationId}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { data: prescription } = await res.json()
      onCreated(prescription)
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
      >
        Nova Receita
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nova Receita</h2>
          <button onClick={() => setOpen(false)} className="text-gray-500 text-xl leading-none">
            &times;
          </button>
        </div>
        <PrescriptionForm
          consultationId={consultationId}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </div>
    </div>
  )
}
