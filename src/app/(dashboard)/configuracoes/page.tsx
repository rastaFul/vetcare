'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Upload, Settings, User, Calendar, Bell, Briefcase } from 'lucide-react'
import Image from 'next/image'
import { NotificationSettingsTab } from '@/components/features/notifications/NotificationSettingsTab'

type TabId = 'perfil' | 'calendario' | 'assinatura' | 'notificacoes' | 'profissao'

interface ProfileData {
  id: string
  name: string
  email: string
  crmv?: string
  specialty?: string
  signatureUrl?: string
}

interface CalendarStatus {
  connected: boolean
  calendarId?: string | null
  shareUrl?: string | null
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Meu Perfil', icon: User },
  { id: 'profissao', label: 'Profissão', icon: Briefcase },
  { id: 'calendario', label: 'Google Calendar', icon: Calendar },
  { id: 'assinatura', label: 'Assinatura', icon: Settings },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
]

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('perfil')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [creatingCalendar, setCreatingCalendar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', crmv: '', specialty: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>()
  const [professionForm, setProfessionForm] = useState({ professionType: 'VETERINARIAN', professionalRegLabel: '' })
  const [loadingProfession, setLoadingProfession] = useState(true)

  useEffect(() => {
    fetch('/api/v1/settings/profile')
      .then((r) => r.json())
      .then((b) => {
        setProfile(b.data)
        setForm({
          name: b.data?.name ?? '',
          crmv: b.data?.crmv ?? '',
          specialty: b.data?.specialty ?? '',
        })
        setSignatureUrl(b.data?.signatureUrl)
      })
      .finally(() => setLoadingProfile(false))

    fetch('/api/v1/settings/calendar/status')
      .then((r) => r.json())
      .then((b) => setCalendarStatus(b.data))
      .finally(() => setLoadingCalendar(false))

    fetch('/api/v1/settings/profession')
      .then((r) => r.json())
      .then((b) => {
        if (b.data) setProfessionForm({ professionType: b.data.professionType, professionalRegLabel: b.data.professionalRegLabel ?? '' })
      })
      .finally(() => setLoadingProfession(false))
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/v1/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const b = await res.json()
        setError(b.error?.message ?? 'Erro ao salvar')
        return
      }
      setSuccess('Perfil atualizado com sucesso!')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/v1/settings/signature', { method: 'POST', body: fd })
      if (res.ok) {
        const b = await res.json()
        setSignatureUrl(b.data?.signatureUrl)
        setSuccess('Assinatura salva!')
      } else {
        setError('Erro ao salvar assinatura')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seu perfil e integrações</p>
      </div>

      {/* Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSuccess('')
                  setError('')
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
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

        <div className="p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Perfil Tab */}
          {activeTab === 'perfil' && (
            <>
              {loadingProfile ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                      className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CRMV</label>
                    <input
                      type="text"
                      value={form.crmv}
                      onChange={(e) => setForm((f) => ({ ...f, crmv: e.target.value }))}
                      placeholder="Ex: CRMV-SP 12345"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                    <input
                      type="text"
                      value={form.specialty}
                      onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                      placeholder="Ex: Clínica Geral, Cirurgia..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? 'Salvando...' : 'Salvar perfil'}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendario' && (
            <>
              {loadingCalendar ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {calendarStatus?.connected ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {calendarStatus?.connected ? 'Calendário ativo' : 'Sem calendário'}
                        </p>
                        {calendarStatus?.calendarId && (
                          <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{calendarStatus.calendarId}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={calendarStatus?.connected
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                      }
                    >
                      {calendarStatus?.connected ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {calendarStatus?.connected ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        Consultas e sessões agendadas serão sincronizadas automaticamente com o calendário dedicado do tenant.
                      </p>
                      {calendarStatus.shareUrl && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-xs font-medium text-blue-700 mb-1">Link de inscrição no calendário</p>
                          <p className="text-xs text-blue-600 break-all">{calendarStatus.shareUrl}</p>
                          <a
                            href={calendarStatus.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700 hover:underline font-medium"
                          >
                            Ver no Google Calendar
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 space-y-3">
                      <p>
                        Crie um calendário Google dedicado para este tenant. Todos os agendamentos serão sincronizados automaticamente, sem necessidade de permissões extras no login.
                      </p>
                      <Button
                        onClick={async () => {
                          setCreatingCalendar(true)
                          setError('')
                          setSuccess('')
                          try {
                            const res = await fetch('/api/v1/settings/calendar/setup', { method: 'POST' })
                            const b = await res.json()
                            if (!res.ok) {
                              setError(b.error?.message ?? 'Erro ao criar calendário')
                              return
                            }
                            setCalendarStatus({ connected: true, calendarId: b.data?.calendarId, shareUrl: b.data?.shareUrl })
                            setSuccess('Calendário VetCare criado com sucesso!')
                          } finally {
                            setCreatingCalendar(false)
                          }
                        }}
                        disabled={creatingCalendar}
                        className="gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        {creatingCalendar ? 'Criando...' : 'Criar Calendário VetCare'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Profissão Tab */}
          {activeTab === 'profissao' && (
            <>
              {loadingProfession ? (
                <div className="space-y-4">{[1,2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Profissão</label>
                    <select
                      value={professionForm.professionType}
                      onChange={(e) => setProfessionForm((f) => ({ ...f, professionType: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="VETERINARIAN">🐾 Veterinário(a)</option>
                      <option value="MASSAGE_THERAPIST">💆 Massoterapeuta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registro Profissional</label>
                    <input
                      type="text"
                      value={professionForm.professionalRegLabel}
                      onChange={(e) => setProfessionForm((f) => ({ ...f, professionalRegLabel: e.target.value }))}
                      placeholder="Ex: CRMV-SP 12345, CMT 678..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      setSaving(true); setError(''); setSuccess('')
                      try {
                        const res = await fetch('/api/v1/settings/profession', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(professionForm),
                        })
                        if (!res.ok) { const b = await res.json(); setError(b.error?.message ?? 'Erro'); return }
                        setSuccess('Configuração de profissão salva!')
                      } finally { setSaving(false) }
                    }}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <p className="text-xs text-gray-400">Ao alterar o tipo de profissão, faça logout e login novamente para atualizar o menu.</p>
                </div>
              )}
            </>
          )}

          {/* Notificações Tab */}
          {activeTab === 'notificacoes' && <NotificationSettingsTab />}

          {/* Assinatura Tab */}
          {activeTab === 'assinatura' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Sua assinatura digitalizada será usada nas receitas geradas em PDF.
              </p>

              {signatureUrl && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Assinatura atual:</p>
                  <Image
                    src={signatureUrl}
                    alt="Assinatura"
                    width={300}
                    height={100}
                    className="max-h-24 object-contain"
                  />
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSignatureUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={saving}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {signatureUrl ? 'Substituir assinatura' : 'Enviar assinatura'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
