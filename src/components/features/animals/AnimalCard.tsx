'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { AnimalSpeciesIcon } from './AnimalSpeciesIcon'
import { SPECIES_LABELS } from '@/modules/patients/application/dtos/AnimalDTO'

interface AnimalCardProps {
  id: string
  name: string
  species: string
  breed?: string
  tutorName?: string
  photoUrl?: string
  status: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-700 border-green-200' },
  DECEASED: { label: 'Falecido', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  INACTIVE: { label: 'Inativo', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

export function AnimalCard({
  id,
  name,
  species,
  breed,
  tutorName,
  photoUrl,
  status,
}: AnimalCardProps) {
  const badge = statusConfig[status] ?? statusConfig.ACTIVE

  return (
    <Link href={`/animais/${id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AnimalSpeciesIcon species={species} className="w-6 h-6 text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
              <Badge variant="outline" className={badge.className}>
                {badge.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {SPECIES_LABELS[species] ?? species}
              {breed ? ` — ${breed}` : ''}
            </p>
            {tutorName && (
              <p className="text-xs text-gray-400 mt-1 truncate">Tutor: {tutorName}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
