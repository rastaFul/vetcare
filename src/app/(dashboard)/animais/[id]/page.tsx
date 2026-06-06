'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Pencil,
  Stethoscope,
  Shield,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimalDialog } from '@/components/features/animals/AnimalDialog'
import { AnimalSpeciesIcon } from '@/components/features/animals/AnimalSpeciesIcon'
import { AnimalFormValues } from '@/components/features/animals/AnimalForm'
import { SPECIES_LABELS, SEX_LABELS } from '@/modules/patients/application/dtos/AnimalDTO'
import { ConsultationCard } from '@/components/features/consultations/ConsultationCard'
import { TimelineEntry } from '@/components/features/timeline/TimelineEntry'
import { PreventiveTab } from '@/components/features/preventive/PreventiveTab'
import { AttachmentsTab } from '@/components/features/documents/AttachmentsTab'
import { PrescriptionsTab } from '@/components/features/prescriptions/PrescriptionsTab'

interface AnimalDetail {
  id: string
  tutorId: string
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string
  ageInYears?: number
  weightKg?: number
  color?: string
  castrated: boolean
  microchip?: string
  photoUrl?: string
  notes?: string
  status: string
  createdAt: string
  tutor?: {
    id: string
    name: string
    phone: string
    email?: string
  }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-700 border-green-200' },
  DECEASED: { label: 'Falecido', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  INACTIVE: { label: 'Inativo', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

interface ConsultationItem {
  id: string
  scheduledAt: string
  status: string
  address?: { street?: string; number?: string; city?: string }
}

interface TimelineItem {
  id: string
  type: 'CONSULTATION' | 'VACCINATION' | 'DEWORMING' | 'ANTI_FLEAS' | 'PRESCRIPTION' | 'ATTACHMENT'
  date: string
  title: string
  summary?: string
  metadata?: Record<string, unknown>
}

type TabId = 'timeline' | 'consultas' | 'preventivo' | 'arquivos' | 'receitas'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'timeline', label: 'Timeline', icon: FileText },
  { id: 'consultas', label: 'Consultas', icon: Stethoscope },
  { id: 'preventivo', label: 'Preventivo', icon: Shield },
  { id: 'arquivos', label: 'Arquivos', icon: FolderOpen },
  { id: 'receitas', label: 'Receitas', icon: FileText },
]

export default function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [animal, setAnimal] = useState<AnimalDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('timeline')
  const [consultations, setConsultations] = useState<ConsultationItem[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [tabLoading, setTabLoading] = useState(false)

  const fetchAnimal = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/v1/animals/${id}`)
      if (!res.ok) {
        router.push('/animais')
        return
      }
      const body = await res.json()
      setAnimal(body.data)
    } catch {
      router.push('/animais')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTabData = useCallback(async (tab: TabId) => {
    if (tab === 'consultas') {
      setTabLoading(true)
      try {
        const res = await fetch(`/api/v1/consultations?animalId=${id}&pageSize=50`)
        if (res.ok) {
          const body = await res.json()
          setConsultations(body.data ?? [])
        }
      } finally {
        setTabLoading(false)
      }
    } else if (tab === 'timeline') {
      setTabLoading(true)
      try {
        const res = await fetch(`/api/v1/animals/${id}/timeline?pageSize=50`)
        if (res.ok) {
          const body = await res.json()
          setTimeline(body.data ?? [])
        }
      } finally {
        setTabLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    fetchAnimal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    fetchTabData(activeTab)
  }, [activeTab, fetchTabData])

  const editDefaults: Partial<AnimalFormValues> | undefined = animal
    ? {
        tutorId: animal.tutorId,
        name: animal.name,
        species: animal.species as AnimalFormValues['species'],
        breed: animal.breed,
        sex: animal.sex as AnimalFormValues['sex'],
        birthDate: animal.birthDate ? animal.birthDate.split('T')[0] : undefined,
        weightKg: animal.weightKg !== undefined ? String(animal.weightKg) : undefined,
        color: animal.color,
        castrated: animal.castrated,
        microchip: animal.microchip,
        notes: animal.notes,
      }
    : undefined

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-48 rounded-xl mb-4" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!animal) return null

  const badge = statusConfig[animal.status] ?? statusConfig.ACTIVE

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/animais"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Animais
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">{animal.name}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {animal.photoUrl ? (
              <Image
                src={animal.photoUrl}
                alt={animal.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <AnimalSpeciesIcon species={animal.species} className="w-8 h-8 text-blue-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{animal.name}</h1>
                <p className="text-sm text-gray-500">
                  {SPECIES_LABELS[animal.species] ?? animal.species}
                  {animal.breed ? ` — ${animal.breed}` : ''}
                </p>
                {animal.tutor && (
                  <Link
                    href={`/tutores/${animal.tutor.id}`}
                    className="text-xs text-blue-600 hover:underline mt-0.5 block"
                  >
                    Tutor: {animal.tutor.name}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={badge.className}>
                  {badge.label}
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
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoItem label="Sexo" value={SEX_LABELS[animal.sex] ?? animal.sex} />
          <InfoItem
            label="Idade"
            value={
              animal.ageInYears !== undefined
                ? `${animal.ageInYears} ${animal.ageInYears === 1 ? 'ano' : 'anos'}`
                : animal.birthDate
                ? new Date(animal.birthDate).toLocaleDateString('pt-BR')
                : '—'
            }
          />
          <InfoItem
            label="Peso"
            value={animal.weightKg ? `${animal.weightKg} kg` : '—'}
          />
          <InfoItem label="Castrado" value={animal.castrated ? 'Sim' : 'Não'} />
          <InfoItem label="Microchip" value={animal.microchip ?? '—'} />
          {animal.color && <InfoItem label="Cor" value={animal.color} />}
        </div>

        {animal.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Observações</p>
            <p className="text-sm text-gray-700">{animal.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'timeline' && (
          <div className="p-4">
            {tabLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : timeline.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-sm">Nenhum evento na timeline</p>
              </div>
            ) : (
              <div className="space-y-1">
                {timeline.map(entry => (
                  <TimelineEntry key={`${entry.type}-${entry.id}`} {...entry} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'consultas' && (
          <div className="p-4">
            {tabLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded" />)}
              </div>
            ) : consultations.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-sm">Nenhuma consulta registrada</p>
                <Link href="/consultas" className="text-xs text-blue-600 hover:underline mt-1 block">
                  Agendar consulta
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map(c => (
                  <ConsultationCard
                    key={c.id}
                    id={c.id}
                    scheduledAt={c.scheduledAt}
                    status={c.status}
                    address={c.address}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preventivo' && (
          <div className="p-4">
            <PreventiveTab animalId={id} />
          </div>
        )}

        {activeTab === 'arquivos' && (
          <div className="p-4">
            <AttachmentsTab animalId={id} />
          </div>
        )}

        {activeTab === 'receitas' && (
          <div className="p-4">
            <PrescriptionsTab animalId={id} />
          </div>
        )}
      </div>

      {editOpen && editDefaults && (
        <AnimalDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={fetchAnimal}
          animalId={animal.id}
          defaultValues={editDefaults}
          mode="edit"
        />
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}
