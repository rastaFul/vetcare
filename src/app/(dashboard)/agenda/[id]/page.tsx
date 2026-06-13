'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, MapPin, User, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SessionDetail {
  id: string
  clientId: string
  serviceId?: string
  scheduledAt: string
  status: string
  address?: { street?: string; number?: string; neighborhood?: string; city?: string; state?: string }
  notes?: string
  priceCharged?: number
  returnDate?: string
  client?: { id: string; name: string; phone: string }
  service?: { id: string; name: string; durationMin: number; price: number }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [completeData, setCompleteData] = useState({ notes: '', priceCharged: '', returnDate: '' })

  const fetch_ = async () => {
    try {
      const res = await fetch(`/api/v1/sessions/${id}`)
      if (!res.ok) { router.push('/agenda'); return }
      const body = await res.json()
      setSession(body.data)
    } catch {
      router.push('/agenda')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (status: string, extra?: Record<string, unknown>) => {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/v1/sessions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Erro ao atualizar')
        return
      }
      await fetch_()
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    await changeStatus('COMPLETED', {
      notes: completeData.notes || undefined,
      priceCharged: completeData.priceCharged ? Number(completeData.priceCharged) : undefined,
      returnDate: completeData.returnDate ? new Date(completeData.returnDate).toISOString() : undefined,
    })
    setShowCompleteForm(false)
  }

  if (isLoading) {
    return <div className="max-w-2xl mx-auto"><Skeleton className="h-6 w-32 mb-6" /><Skeleton className="h-48 rounded-xl mb-4" /></div>
  }
  if (!session) return null

  const badge = statusConfig[session.status] ?? statusConfig.SCHEDULED
  const date = new Date(session.scheduledAt)
  const hasAddress = session.address?.street || session.address?.city

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/agenda" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" />
          Agenda
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">{session.service?.name ?? 'Sessão'}</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{session.service?.name ?? 'Sessão'}</h1>
            {session.client && (
              <Link href={`/clientes/${session.client.id}`} className="text-sm text-gray-500 hover:text-gray-700 mt-0.5 block">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{session.client.name} — {session.client.phone}</span>
              </Link>
            )}
          </div>
          <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            {format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
          {session.service && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              {session.service.durationMin} min — R$ {session.service.price.toFixed(2)}
            </div>
          )}
          {hasAddress && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span>
                {session.address?.street}{session.address?.number ? `, ${session.address.number}` : ''}
                {session.address?.neighborhood ? ` — ${session.address.neighborhood}` : ''}
                {session.address?.city ? `, ${session.address.city}` : ''}
              </span>
            </div>
          )}
          {session.priceCharged !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
              Cobrado: R$ {session.priceCharged.toFixed(2)}
            </div>
          )}
        </div>

        {session.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Anotações</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}

        {session.returnDate && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-orange-400" />
            Retorno: {format(new Date(session.returnDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
          </div>
        )}
      </div>

      {/* Concluir form */}
      {showCompleteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Concluir Sessão</h2>
            <div className="space-y-4">
              <div>
                <Label>Valor cobrado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={completeData.priceCharged}
                  onChange={(e) => setCompleteData((d) => ({ ...d, priceCharged: e.target.value }))}
                  placeholder={session.service?.price.toFixed(2)}
                />
              </div>
              <div>
                <Label>Anotações pós-sessão</Label>
                <Textarea
                  value={completeData.notes}
                  onChange={(e) => setCompleteData((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="Como foi a sessão..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Data de retorno</Label>
                <Input
                  type="date"
                  value={completeData.returnDate}
                  onChange={(e) => setCompleteData((d) => ({ ...d, returnDate: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCompleteForm(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleComplete} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                  {actionLoading ? 'Salvando...' : 'Concluir'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2">
          {session.status === 'SCHEDULED' && (
            <Button variant="outline" onClick={() => changeStatus('CONFIRMED')} disabled={actionLoading} className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50">
              <CheckCircle className="w-4 h-4" />
              Confirmar
            </Button>
          )}
          <Button onClick={() => setShowCompleteForm(true)} disabled={actionLoading} className="gap-1.5 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4" />
            Concluir
          </Button>
          <Button variant="outline" onClick={() => changeStatus('CANCELLED')} disabled={actionLoading} className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50">
            <XCircle className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
