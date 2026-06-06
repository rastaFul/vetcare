'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import { SendReminderModal } from './SendReminderModal'

interface Props {
  tutorId: string
  animalId: string
  type: 'CONSULTATION_REMINDER' | 'VACCINATION_REMINDER' | 'RETURN_REMINDER'
  vars: {
    date: string
    time?: string
    address?: string
    vaccine?: string
    vetName: string
    tutorName: string
    animalName: string
  }
  size?: 'sm' | 'default'
}

export function SendReminderButton({ tutorId, animalId, type, vars, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Bell className="w-3.5 h-3.5" />
        Enviar lembrete
      </Button>
      {open && (
        <SendReminderModal
          tutorId={tutorId}
          animalId={animalId}
          type={type}
          vars={vars}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
