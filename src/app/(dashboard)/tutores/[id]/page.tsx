'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Phone, Mail, MapPin, FileText, Pencil, PawPrint, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TutorDialog } from '@/components/features/tutors/TutorDialog'
import { TutorFormValues } from '@/components/features/tutors/TutorForm'

interface Animal {
  id: string
  name: string
  species: string
  breed?: string
  status: string
}

interface TutorDetail {
  id: string
  name: string
  cpf?: string
  phone: string
  whatsapp?: string
  email?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  notes?: string
  status: string
  animals: Animal[]
  createdAt: string
  updatedAt: string
}

interface NotificationLogEntry {
  id: string
  type: string
  channel: 'WHATSAPP' | 'EMAIL'
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED'
  sentAt?: string
  createdAt: string
  message: string
}

function formatPhone(p: string) {
  const d = p.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return p
}

function formatAddress(addr?: TutorDetail['address']) {
  if (!addr) return null
  const parts = [
    addr.street && `${addr.street}${addr.number ? `, ${addr.number}` : ''}`,
    addr.complement,
    addr.neighborhood,
    addr.city && addr.state ? `${addr.city} - ${addr.state}` : addr.city || addr.state,
    addr.zipCode,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tutor, setTutor] = useState<TutorDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [notifLogs, setNotifLogs] = useState<NotificationLogEntry[]>([])

  const fetchTutor = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/tutors/${id}`)
      if (!res.ok) {
        router.push('/tutores')
        return
      }
      const body = await res.json()
      setTutor(body.data)
    } catch {
      router.push('/tutores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTutor()
    fetch(`/api/v1/notifications/logs?tutorId=${id}&limit=10`)
      .then(r => r.json())
      .then(b => { if (b.data) setNotifLogs(b.data) })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const editDefaults: Partial<TutorFormValues> | undefined = tutor
    ? {
        name: tutor.name,
        cpf: tutor.cpf,
        phone: tutor.phone,
        whatsapp: tutor.whatsapp,
        email: tutor.email,
        street: tutor.address?.street,
        number: tutor.address?.number,
        complement: tutor.address?.complement,
        neighborhood: tutor.address?.neighborhood,
        city: tutor.address?.city,
        state: tutor.address?.state,
        zipCode: tutor.address?.zipCode,
        notes: tutor.notes,
      }
    : undefined

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-40 rounded-xl mb-4" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!tutor) return null

  const address = formatAddress(tutor.address)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/tutores"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Tutores
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">{tutor.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tutor.name}</h1>
            {tutor.cpf && <p className="text-sm text-gray-400 mt-0.5">CPF: {tutor.cpf}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={tutor.status === 'ACTIVE' ? 'default' : 'outline'}
              className={
                tutor.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : ''
              }
            >
              {tutor.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="gap-1"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-gray-700">{formatPhone(tutor.phone)}</p>
              {tutor.whatsapp && tutor.whatsapp !== tutor.phone && (
                <p className="text-gray-500 text-xs">
                  WhatsApp: {formatPhone(tutor.whatsapp)}
                </p>
              )}
            </div>
          </div>

          {tutor.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-gray-700">{tutor.email}</p>
            </div>
          )}

          {address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{address}</p>
            </div>
          )}

          {tutor.notes && (
            <div className="flex items-start gap-3 text-sm">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 italic">{tutor.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PawPrint className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">
            Animais ({tutor.animals.length})
          </h2>
        </div>

        {tutor.animals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <PawPrint className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">Nenhum animal cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tutor.animals.map((animal) => (
              <Link
                key={animal.id}
                href={`/animais/${animal.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{animal.name}</p>
                  <p className="text-xs text-gray-500">
                    {animal.species}
                    {animal.breed ? ` — ${animal.breed}` : ''}
                  </p>
                </div>
                <Badge
                  variant={animal.status === 'ACTIVE' ? 'default' : 'outline'}
                  className={
                    animal.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : ''
                  }
                >
                  {animal.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notification History */}
      {notifLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              Histórico de Notificações
            </h2>
          </div>
          <div className="space-y-0">
            {notifLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    log.status === 'SENT' || log.status === 'DELIVERED'
                      ? 'bg-green-500'
                      : log.status === 'FAILED'
                      ? 'bg-red-500'
                      : 'bg-amber-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {log.type === 'CONSULTATION_REMINDER'
                      ? 'Lembrete de Consulta'
                      : log.type === 'VACCINATION_REMINDER'
                      ? 'Lembrete de Vacina'
                      : log.type === 'RETURN_REMINDER'
                      ? 'Lembrete de Retorno'
                      : 'Mensagem'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{log.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                    {log.channel === 'WHATSAPP' ? 'WhatsApp' : 'E-mail'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    log.status === 'SENT' || log.status === 'DELIVERED'
                      ? 'bg-green-100 text-green-700'
                      : log.status === 'FAILED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {log.status === 'SENT' ? 'Enviado' : log.status === 'DELIVERED' ? 'Entregue' : log.status === 'FAILED' ? 'Falhou' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editOpen && editDefaults && (
        <TutorDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={fetchTutor}
          tutorId={tutor.id}
          defaultValues={editDefaults}
          mode="edit"
        />
      )}
    </div>
  )
}
