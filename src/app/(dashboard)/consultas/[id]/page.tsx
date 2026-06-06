'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, MapPin, User, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CompleteConsultationForm, CompleteConsultationFormValues } from '@/components/features/consultations/CompleteConsultationForm'
import { PrescriptionsTab } from '@/components/features/prescriptions/PrescriptionsTab'
import { AttachmentsTab } from '@/components/features/documents/AttachmentsTab'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SendReminderButton } from '@/components/features/notifications/SendReminderButton'

interface ConsultationDetail {
  id: string
  animalId: string
  veterinarianId: string
  scheduledAt: string
  status: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  observations?: string
  anamnesis?: string
  diagnosis?: string
  returnDate?: string
  googleCalendarEventId?: string
  animal?: {
    id: string
    name: string
    species: string
    tutor?: {
      id: string
      name: string
      phone: string
    }
  }
  veterinarian?: {
    id: string
    name: string
  }
  prescriptions?: unknown[]
  attachments?: unknown[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: 'Agendada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700 border-red-200' },
}

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCompleteForm, setShowCompleteForm] = useState(false)

  const fetchConsultation = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/consultations/${id}`)
      if (!res.ok) {
        router.push('/consultas')
        return
      }
      const body = await res.json()
      setConsultation(body.data)
    } catch {
      router.push('/consultas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConsultation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const changeStatus = async (status: string, extra?: Record<string, unknown>) => {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/v1/consultations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Erro ao atualizar status')
        return
      }
      await fetchConsultation()
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (data: CompleteConsultationFormValues) => {
    await changeStatus('COMPLETED', {
      anamnesis: data.anamnesis,
      diagnosis: data.diagnosis,
      observations: data.observations,
      returnDate: data.returnDate ? new Date(data.returnDate).toISOString() : undefined,
      createReturnReminder: data.createReturnReminder,
    })
    setShowCompleteForm(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-48 rounded-xl mb-4" />
      </div>
    )
  }

  if (!consultation) return null

  const badge = statusConfig[consultation.status] ?? statusConfig.SCHEDULED
  const date = new Date(consultation.scheduledAt)
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })

  const hasAddress = consultation.address?.street || consultation.address?.city

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/consultas"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Consultas
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">Consulta</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            {consultation.animal && (
              <Link
                href={`/animais/${consultation.animal.id}`}
                className="text-lg font-bold text-blue-600 hover:underline"
              >
                {consultation.animal.name}
              </Link>
            )}
            {consultation.animal?.tutor && (
              <Link
                href={`/tutores/${consultation.animal.tutor.id}`}
                className="block text-sm text-gray-500 hover:text-gray-700 mt-0.5"
              >
                Tutor: {consultation.animal.tutor.name} — {consultation.animal.tutor.phone}
              </Link>
            )}
          </div>
          <Badge variant="outline" className={badge.className}>
            {badge.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formattedDate}
          </div>

          {consultation.veterinarian && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              {consultation.veterinarian.name}
            </div>
          )}

          {hasAddress && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                {consultation.address?.street && (
                  <span>
                    {consultation.address.street}
                    {consultation.address.number ? `, ${consultation.address.number}` : ''}
                    {consultation.address.complement ? ` — ${consultation.address.complement}` : ''}
                  </span>
                )}
                {consultation.address?.neighborhood && (
                  <span className="block text-gray-400 text-xs">{consultation.address.neighborhood}</span>
                )}
                {consultation.address?.city && (
                  <span className="block text-gray-400 text-xs">
                    {consultation.address.city}
                    {consultation.address.state ? `/${consultation.address.state}` : ''}
                    {consultation.address.zipCode ? ` — CEP ${consultation.address.zipCode}` : ''}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {consultation.observations && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Observações</p>
            <p className="text-sm text-gray-700">{consultation.observations}</p>
          </div>
        )}

        {consultation.returnDate && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-orange-400" />
            <span>
              Retorno:{' '}
              {format(new Date(consultation.returnDate), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}
      </div>

      {/* Clinical notes (COMPLETED) */}
      {consultation.status === 'COMPLETED' && (consultation.anamnesis || consultation.diagnosis) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Conclusão Clínica</h2>
          {consultation.anamnesis && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Anamnese</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{consultation.anamnesis}</p>
            </div>
          )}
          {consultation.diagnosis && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Diagnóstico</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{consultation.diagnosis}</p>
            </div>
          )}
        </div>
      )}

      {/* Prescriptions */}
      {consultation.animalId && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <PrescriptionsTab consultationId={id} animalId={consultation.animalId} />
        </div>
      )}

      {/* Attachments */}
      {consultation.animalId && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <AttachmentsTab animalId={consultation.animalId} />
        </div>
      )}

      {/* Complete form modal */}
      {showCompleteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Concluir Consulta</h2>
            <CompleteConsultationForm
              onSubmit={handleComplete}
              onCancel={() => setShowCompleteForm(false)}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {consultation.status !== 'COMPLETED' && consultation.status !== 'CANCELLED' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2">
          {consultation.status === 'SCHEDULED' && (
            <Button
              variant="outline"
              onClick={() => changeStatus('CONFIRMED')}
              disabled={actionLoading}
              className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar
            </Button>
          )}

          <Button
            onClick={() => setShowCompleteForm(true)}
            disabled={actionLoading}
            className="gap-1.5 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Concluir
          </Button>

          <Button
            variant="outline"
            onClick={() => changeStatus('CANCELLED')}
            disabled={actionLoading}
            className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4" />
            Cancelar
          </Button>

          {/* Enviar lembrete — só se tem tutor */}
          {consultation.animal?.tutor && (
            <SendReminderButton
              tutorId={consultation.animal.tutor.id}
              animalId={consultation.animalId}
              type="CONSULTATION_REMINDER"
              vars={{
                date: format(new Date(consultation.scheduledAt), 'dd/MM/yyyy'),
                time: format(new Date(consultation.scheduledAt), 'HH:mm'),
                address: consultation.address?.street
                  ? [
                      consultation.address.street,
                      consultation.address.number,
                      consultation.address.neighborhood,
                      consultation.address.city,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : undefined,
                vetName: consultation.veterinarian?.name ?? 'Dra.',
                tutorName: consultation.animal.tutor.name,
                animalName: consultation.animal.name,
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
