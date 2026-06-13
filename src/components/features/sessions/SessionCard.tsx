import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

interface SessionCardProps {
  id: string
  scheduledAt: string
  status: string
  client?: { name: string } | null
  service?: { name: string } | null
  priceCharged?: number
}

export function SessionCard({ id, scheduledAt, status, client, service, priceCharged }: SessionCardProps) {
  const badge = statusConfig[status] ?? statusConfig.SCHEDULED

  return (
    <Link
      href={`/agenda/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{service?.name ?? 'Sessão'}</p>
          {client && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <User className="w-3.5 h-3.5" />
              {client.name}
            </div>
          )}
        </div>
        <Badge variant="outline" className={`${badge.className} ml-2 flex-shrink-0`}>{badge.label}</Badge>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Calendar className="w-3.5 h-3.5" />
        {format(new Date(scheduledAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
        {priceCharged ? ` — R$ ${priceCharged.toFixed(2)}` : ''}
      </div>
    </Link>
  )
}
