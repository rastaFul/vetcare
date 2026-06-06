'use client'

import { Bird, Cat, Dog, Rabbit, Snail, PawPrint } from 'lucide-react'
import { Species } from '@/modules/patients/domain/entities/Animal'

interface AnimalSpeciesIconProps {
  species: Species | string
  className?: string
}

export function AnimalSpeciesIcon({ species, className = 'w-5 h-5' }: AnimalSpeciesIconProps) {
  switch (species) {
    case 'DOG':
      return <Dog className={className} />
    case 'CAT':
      return <Cat className={className} />
    case 'BIRD':
      return <Bird className={className} />
    case 'RABBIT':
      return <Rabbit className={className} />
    case 'REPTILE':
      return <Snail className={className} />
    default:
      return <PawPrint className={className} />
  }
}
