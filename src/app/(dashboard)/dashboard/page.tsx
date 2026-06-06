'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, RotateCcw, Syringe, PawPrint, Users, Stethoscope } from 'lucide-react'

interface ConsultationToday {
  id: string
  scheduledAt: string
  status: string
  animal: { id: string; name: string; species: string }
  address?: string
}

interface PendingReturn {
  id: string
  returnDate?: string
  animal: { id: string; name: string }
}

interface UpcomingVaccination {
  id: string
  vaccine: string
  nextDoseAt?: string
  animal: { id: string; name: string }
}

interface DashboardData {
  consultationsToday: ConsultationToday[]
  pendingReturns: PendingReturn[]
  upcomingVaccinations: UpcomingVaccination[]
  totals: {
    animals: number
    tutors: number
    consultationsThisMonth: number
  }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const SPECIES_LABELS: Record<string, string> = {
  DOG: 'Cão',
  CAT: 'Gato',
  BIRD: 'Ave',
  RABBIT: 'Coelho',
  HAMSTER: 'Hamster',
  OTHER: 'Outro',
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/dashboard')
      .then((r) => r.json())
      .then((body) => setData(body.data))
      .catch(() => setData(null))
      .finally(() => setIsLoading(false))
  }, [])

  const greeting = getGreeting()
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Usuário'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {firstName}!
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Consultas hoje</p>
                <p className="text-2xl font-bold text-gray-900">{data?.consultationsToday.length ?? 0}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Retornos esta semana</p>
                <p className="text-2xl font-bold text-gray-900">{data?.pendingReturns.length ?? 0}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Syringe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vacinas em 30 dias</p>
                <p className="text-2xl font-bold text-gray-900">{data?.upcomingVaccinations.length ?? 0}</p>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultas de Hoje */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Consultas de Hoje</h2>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded" />)}
            </div>
          ) : !data?.consultationsToday?.length ? (
            <div className="p-8 text-center text-gray-400">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma consulta hoje</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.consultationsToday.map((c) => {
                const badge = statusConfig[c.status] ?? statusConfig.SCHEDULED
                return (
                  <li key={c.id}>
                    <Link
                      href={`/consultas/${c.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-center flex-shrink-0 w-10">
                        <span className="text-sm font-bold text-gray-800">{formatTime(c.scheduledAt)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.animal.name}</p>
                        <p className="text-xs text-gray-500">
                          {SPECIES_LABELS[c.animal.species] ?? c.animal.species}
                          {c.address ? ` — ${c.address}` : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Vacinas Próximas */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-gray-800">Vacinas Próximas (30 dias)</h2>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-14 rounded" />)}
            </div>
          ) : !data?.upcomingVaccinations?.length ? (
            <div className="p-8 text-center text-gray-400">
              <Syringe className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma vacina nos próximos 30 dias</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.upcomingVaccinations.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/animais/${v.animal.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.animal.name}</p>
                      <p className="text-xs text-gray-500">{v.vaccine}</p>
                    </div>
                    {v.nextDoseAt && (
                      <span className="text-xs text-purple-600 font-medium flex-shrink-0">
                        {formatDate(v.nextDoseAt)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Totals footer */}
      {isLoading ? (
        <Skeleton className="h-20 rounded-xl" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <PawPrint className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Animais ativos</p>
              <p className="text-xl font-bold text-gray-800">{data?.totals.animals ?? 0}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Tutores ativos</p>
              <p className="text-xl font-bold text-gray-800">{data?.totals.tutors ?? 0}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Consultas este mês</p>
              <p className="text-xl font-bold text-gray-800">{data?.totals.consultationsThisMonth ?? 0}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
