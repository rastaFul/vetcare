'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Phone, Mail, Calendar, FileText, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ClientDetail {
  id: string
  name: string
  phone: string
  whatsapp?: string
  email?: string
  birthDate?: string
  address?: {
    street?: string; number?: string; complement?: string
    neighborhood?: string; city?: string; state?: string; zipCode?: string
  }
  notes?: string
  status: string
}

interface SessionItem {
  id: string
  scheduledAt: string
  status: string
  service?: { name: string }
  priceCharged?: number
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [clientRes, sessionsRes] = await Promise.all([
          fetch(`/api/v1/clients/${id}`),
          fetch(`/api/v1/clients/${id}/sessions?pageSize=20`),
        ])
        if (!clientRes.ok) { router.push('/clientes'); return }
        const clientBody = await clientRes.json()
        const sessionsBody = sessionsRes.ok ? await sessionsRes.json() : { data: [] }
        setClient(clientBody.data)
        setSessions(sessionsBody.data ?? [])
      } catch {
        router.push('/clientes')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, router])

  const toggleStatus = async () => {
    if (!client) return
    const newStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch(`/api/v1/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setClient((c) => c ? { ...c, status: newStatus } : c)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-48 rounded-xl mb-4" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/clientes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" />
          Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
            {client.status === 'INACTIVE' && (
              <Badge variant="outline" className="mt-1 text-xs bg-gray-50 text-gray-500">Inativo</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(`/agenda?clientId=${id}`)}>
              <Calendar className="w-4 h-4" />
              Nova Sessão
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStatus}
              className={client.status === 'ACTIVE' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
            >
              {client.status === 'ACTIVE' ? <><X className="w-4 h-4 mr-1" />Desativar</> : <><Check className="w-4 h-4 mr-1" />Ativar</>}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            {client.phone}
            {client.whatsapp && client.whatsapp !== client.phone && ` | WhatsApp: ${client.whatsapp}`}
          </div>
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              {client.email}
            </div>
          )}
          {client.birthDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              {format(new Date(client.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          )}
        </div>

        {client.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Observações</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Histórico de sessões */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-800">Histórico de Sessões</h2>
        </div>
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma sessão registrada</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {sessions.map((s) => {
              const badge = statusConfig[s.status] ?? statusConfig.SCHEDULED
              return (
                <li key={s.id}>
                  <Link href={`/agenda/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {s.service?.name ?? 'Sessão'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(s.scheduledAt), "dd/MM/yyyy 'às' HH:mm")}
                        {s.priceCharged ? ` — R$ ${s.priceCharged.toFixed(2)}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Editar button */}
      <div className="mt-4">
        <Button variant="outline" className="gap-2 w-full" onClick={() => router.push(`/clientes/${id}/editar`)}>
          <Edit2 className="w-4 h-4" />
          Editar Cliente
        </Button>
      </div>
    </div>
  )
}
