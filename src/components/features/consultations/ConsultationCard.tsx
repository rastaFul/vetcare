'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ConsultationCardProps {
  id: string
  animalName?: string
  animalId?: string
  veterinarianName?: string
  scheduledAt: string
  status: string
  address?: {
    street?: string
    number?: string
    city?: string
  }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

export function ConsultationCard({
  id,
  animalName,
  animalId,
  veterinarianName,
  scheduledAt,
  status,
  address,
}: ConsultationCardProps) {
  const badge = statusConfig[status] ?? statusConfig.SCHEDULED
  const date = new Date(scheduledAt)
  const formattedDate = format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR })
  const formattedTime = format(date, 'HH:mm')

  const shortAddress =
    address?.street && address?.city
      ? `${address.street}${address.number ? `, ${address.number}` : ''} — ${address.city}`
      : address?.street
      ? `${address.street}${address.number ? `, ${address.number}` : ''}`
      : null

  return (
    <Link href={`/consultas/${id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {animalName && (
              <h3 className="font-semibold text-gray-900 truncate">
                {animalName}
              </h3>
            )}

            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {formattedDate} às {formattedTime}
              </span>
            </div>

            {veterinarianName && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{veterinarianName}</span>
              </div>
            )}

            {shortAddress && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{shortAddress}</span>
              </div>
            )}
          </div>

          <Badge variant="outline" className={badge.className + ' flex-shrink-0'}>
            {badge.label}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
