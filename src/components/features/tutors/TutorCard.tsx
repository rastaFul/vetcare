'use client'

import Link from 'next/link'
import { Phone, Mail, PawPrint } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TutorCardProps {
  id: string
  name: string
  phone: string
  email?: string
  cpf?: string
  status: string
  animalsCount?: number
}

export function TutorCard({ id, name, phone, email, cpf, status, animalsCount }: TutorCardProps) {
  const formatPhone = (p: string) => {
    const d = p.replace(/\D/g, '')
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    return p
  }

  return (
    <Link href={`/tutores/${id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {cpf && <p className="text-xs text-gray-400 mt-0.5">{cpf}</p>}
          </div>
          <Badge
            variant={status === 'ACTIVE' ? 'default' : 'outline'}
            className={status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          >
            {status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatPhone(phone)}</span>
          </div>

          {email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{email}</span>
            </div>
          )}

          {animalsCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PawPrint className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {animalsCount} {animalsCount === 1 ? 'animal' : 'animais'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
