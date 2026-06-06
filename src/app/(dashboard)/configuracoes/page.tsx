'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Upload, Settings, User, Calendar, Bell } from 'lucide-react'
import Image from 'next/image'
import { NotificationSettingsTab } from '@/components/features/notifications/NotificationSettingsTab'

type TabId = 'perfil' | 'calendario' | 'assinatura' | 'notificacoes'

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
  email?: string
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Meu Perfil', icon: User },
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
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', crmv: '', specialty: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>()

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
                          {calendarStatus?.connected ? 'Conectado' : 'Não conectado'}
                        </p>
                        {calendarStatus?.email && (
                          <p className="text-xs text-gray-500">{calendarStatus.email}</p>
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
                    <p className="text-sm text-gray-500">
                      Sua conta do Google Calendar está conectada. Consultas agendadas serão
                      sincronizadas automaticamente.
                    </p>
                  ) : (
                    <div className="text-sm text-gray-500 space-y-3">
                      <p>
                        O Google Calendar é conectado automaticamente durante o login com o Google.
                        Se aparecer como desconectado, saia e entre novamente com sua conta Google.
                      </p>
                      <button
                        onClick={() => { window.location.href = '/api/auth/signin/google' }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Reconectar com Google
                      </button>
                    </div>
                  )}
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
