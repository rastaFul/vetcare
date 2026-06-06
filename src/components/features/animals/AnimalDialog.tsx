'use client'

import { useState } from 'react'
import { AnimalForm, AnimalFormValues } from './AnimalForm'

interface AnimalDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  animalId?: string
  defaultValues?: Partial<AnimalFormValues>
  mode?: 'create' | 'edit'
  fixedTutorId?: string
}

export function AnimalDialog({
  open,
  onClose,
  onSuccess,
  animalId,
  defaultValues,
  mode = 'create',
  fixedTutorId,
}: AnimalDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (data: AnimalFormValues, photoFile?: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = mode === 'edit' && animalId ? `/api/v1/animals/${animalId}` : '/api/v1/animals'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const weightKgNum =
        data.weightKg !== undefined && data.weightKg !== ''
          ? Number(data.weightKg)
          : undefined

      const payload = {
        ...data,
        weightKg: weightKgNum,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error?.message ?? 'Erro ao salvar animal')
      }

      const body = await res.json()
      const savedId = animalId ?? body.data?.id

      // Upload photo if provided
      if (photoFile && savedId) {
        const formData = new FormData()
        formData.append('file', photoFile)
        await fetch(`/api/v1/animals/${savedId}/photo`, {
          method: 'POST',
          body: formData,
        })
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
            {mode === 'create' ? 'Novo Animal' : 'Editar Animal'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <AnimalForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            fixedTutorId={fixedTutorId}
          />
        </div>
      </div>
    </div>
  )
}
