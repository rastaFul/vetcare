'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConsultationCard } from '@/components/features/consultations/ConsultationCard'
import { Skeleton } from '@/components/ui/skeleton'

interface ConsultationListItem {
  id: string
  animalId: string
  veterinarianId: string
  scheduledAt: string
  status: string
  address?: {
    street?: string
    number?: string
    city?: string
  }
  animal?: {
    id: string
    name: string
  }
  veterinarian?: {
    id: string
    name: string
  }
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'SCHEDULED', label: 'Agendadas' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'COMPLETED', label: 'Concluídas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

export default function ConsultasPage() {
  const [consultations, setConsultations] = useState<ConsultationListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const fetchConsultations = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (dateFrom) params.set('dateFrom', new Date(dateFrom).toISOString())
      if (dateTo) params.set('dateTo', new Date(dateTo + 'T23:59:59').toISOString())

      const res = await fetch(`/api/v1/consultations?${params}`)
      if (!res.ok) return
      const body = await res.json()
      setConsultations(body.data ?? [])
      setTotal(body.meta?.total ?? 0)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchConsultations()
  }, [fetchConsultations])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} consulta{total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="flex h-9 w-full sm:w-auto rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 flex-1">
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="flex-1 h-9 text-sm"
            />
            <span className="text-xs text-gray-400 flex-shrink-0">até</span>
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="flex-1 h-9 text-sm"
            />
          </div>

          {(statusFilter || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo('') }}
              className="text-gray-500 hover:text-gray-700 gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Nenhuma consulta encontrada</p>
          <p className="text-xs text-gray-400 mt-1">Agende uma nova consulta para começar.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 gap-1.5">
            <Plus className="w-4 h-4" />
            Nova Consulta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(c => (
            <ConsultationCard
              key={c.id}
              id={c.id}
              animalName={c.animal?.name}
              animalId={c.animal?.id}
              veterinarianName={c.veterinarian?.name}
              scheduledAt={c.scheduledAt}
              status={c.status}
              address={c.address}
            />
          ))}
        </div>
      )}

      {/* Simple modal for new consultation form */}
      {showForm && (
        <NewConsultationModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchConsultations()
          }}
        />
      )}
    </div>
  )
}

function NewConsultationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [animals, setAnimals] = useState<{ id: string; name: string; tutor?: { name: string } }[]>([])
  const [animalSearch, setAnimalSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/v1/animals?search=${encodeURIComponent(animalSearch)}&pageSize=10`)
        .then(r => r.json())
        .then(body => setAnimals(body.data ?? []))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [animalSearch])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const data = new FormData(form)

    const scheduledAtLocal = data.get('scheduledAt') as string
    if (!scheduledAtLocal) {
      setError('Data e hora são obrigatórias')
      return
    }

    const scheduledAt = new Date(scheduledAtLocal).toISOString()

    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId: data.get('animalId'),
          scheduledAt,
          street: data.get('street') || undefined,
          number: data.get('number') || undefined,
          city: data.get('city') || undefined,
          observations: data.get('observations') || undefined,
          createCalendarEvent: (data.get('createCalendarEvent') as string) === 'true',
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Erro ao agendar consulta')
        return
      }

      onSuccess()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nova Consulta</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal *</label>
            <Input
              placeholder="Buscar animal..."
              value={animalSearch}
              onChange={e => setAnimalSearch(e.target.value)}
              className="mb-1"
            />
            <select
              name="animalId"
              required
              className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um animal</option>
              {animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.tutor?.name ? `— ${a.tutor.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label>
            <Input type="datetime-local" name="scheduledAt" required />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
              <Input name="street" placeholder="Rua..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <Input name="number" placeholder="Nº" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <Input name="city" placeholder="Cidade..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              name="observations"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="Observações..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="createCal" name="createCalendarEvent" value="true" defaultChecked className="w-4 h-4" />
            <label htmlFor="createCal" className="text-sm text-gray-600 cursor-pointer">
              Criar evento no Google Calendar
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
