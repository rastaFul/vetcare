'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { ClientForm, ClientFormValues } from './ClientForm'

interface ClientDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClientDialog({ open, onClose, onSuccess }: ClientDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data: ClientFormValues) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Erro ao salvar')
        return
      }
      onSuccess()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Novo Cliente</h2>
          {error && (
            <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}
          <ClientForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Dialog>
  )
}
