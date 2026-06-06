'use client'

import { useState } from 'react'
import { TutorForm, TutorFormValues } from './TutorForm'

interface TutorDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  tutorId?: string
  defaultValues?: Partial<TutorFormValues>
  mode?: 'create' | 'edit'
}

export function TutorDialog({
  open,
  onClose,
  onSuccess,
  tutorId,
  defaultValues,
  mode = 'create',
}: TutorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (data: TutorFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = mode === 'edit' && tutorId ? `/api/v1/tutors/${tutorId}` : '/api/v1/tutors'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error?.message ?? 'Erro ao salvar tutor')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {mode === 'create' ? 'Novo Tutor' : 'Editar Tutor'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <TutorForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
