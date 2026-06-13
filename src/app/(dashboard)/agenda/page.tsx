'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SessionCard } from '@/components/features/sessions/SessionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionForm, SessionFormValues } from '@/components/features/sessions/SessionForm'

function InlineSessionForm({ defaultClientId, onSubmit, onCancel, isLoading }: {
  defaultClientId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}) {
  return <SessionForm defaultClientId={defaultClientId} onSubmit={onSubmit as (data: SessionFormValues) => Promise<void>} onCancel={onCancel} isLoading={isLoading} />
}

interface SessionItem {
  id: string
  scheduledAt: string
  status: string
  client?: { name: string } | null
  service?: { name: string } | null
  priceCharged?: number
}

interface Meta {
  total: number
  page: number
  pageSize: number
}

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendadas' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'COMPLETED', label: 'Concluídas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

export default function AgendaPage() {
  const searchParams = useSearchParams()
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 })
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const defaultClientId = searchParams.get('clientId') ?? undefined

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (status) params.set('status', status)
      if (defaultClientId) params.set('clientId', defaultClientId)

      const res = await fetch(`/api/v1/sessions?${params}`)
      const body = await res.json()
      setSessions(body.data ?? [])
      setMeta(body.meta ?? { total: 0, page: 1, pageSize: 20 })
    } catch {
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }, [page, status, defaultClientId])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const totalPages = Math.ceil(meta.total / meta.pageSize)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} sessões</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Sessão
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatus(opt.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma sessão encontrada</h3>
          <p className="text-sm text-gray-500 mb-6">Agende a primeira sessão.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Sessão
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {sessions.map((s) => <SessionCard key={s.id} {...s} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span className="text-sm text-gray-600">{page} de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Próximo
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal nova sessão */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nova Sessão</h2>
            <NewSessionForm
              defaultClientId={defaultClientId}
              onSuccess={() => { setShowForm(false); fetchSessions() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NewSessionForm({ defaultClientId, onSuccess, onCancel }: { defaultClientId?: string; onSuccess: () => void; onCancel: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt as string).toISOString() : undefined,
          serviceId: data.serviceId || undefined,
          createCalendarEvent: false,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Erro ao agendar')
        return
      }
      onSuccess()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      <InlineSessionForm
        defaultClientId={defaultClientId}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </>
  )
}
