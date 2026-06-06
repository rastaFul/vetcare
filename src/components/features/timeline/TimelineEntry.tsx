'use client'

import { Stethoscope, Shield, Pill, Bug, FileText, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TimelineType = 'CONSULTATION' | 'VACCINATION' | 'DEWORMING' | 'ANTI_FLEAS' | 'PRESCRIPTION' | 'ATTACHMENT'

interface TimelineEntryProps {
  id: string
  type: TimelineType
  date: string
  title: string
  summary?: string
  metadata?: Record<string, unknown>
}

const typeConfig: Record<TimelineType, { icon: React.ElementType; color: string; bg: string }> = {
  CONSULTATION: { icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
  VACCINATION: { icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
  DEWORMING: { icon: Pill, color: 'text-orange-600', bg: 'bg-orange-50' },
  ANTI_FLEAS: { icon: Bug, color: 'text-purple-600', bg: 'bg-purple-50' },
  PRESCRIPTION: { icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
  ATTACHMENT: { icon: Paperclip, color: 'text-gray-600', bg: 'bg-gray-50' },
}

export function TimelineEntry({ type, date, title, summary }: TimelineEntryProps) {
  const config = typeConfig[type] ?? typeConfig.ATTACHMENT
  const Icon = config.icon
  const formattedDate = format(new Date(date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-9 h-9 rounded-full ${config.bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0 pb-4 border-b border-gray-100 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <span className="text-xs text-gray-400 flex-shrink-0">{formattedDate}</span>
        </div>
        {summary && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{summary}</p>
        )}
      </div>
    </div>
  )
}
