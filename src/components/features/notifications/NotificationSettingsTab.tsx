'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, MessageCircle, Mail, RefreshCw, Send, AlertTriangle } from 'lucide-react'
import { WhatsAppQRCode } from './WhatsAppQRCode'

interface NotifStatus {
  whatsapp: {
    configured: boolean
    status: 'connected' | 'disconnected' | 'qr_code' | 'unavailable'
  }
  email: {
    configured: boolean
    fromEmail?: string
  }
}

interface NotifConfig {
  evolutionApiUrl?: string
  evolutionApiKey?: string
  evolutionInstanceName?: string
  resendApiKey?: string
  resendFromEmail?: string
}

export function NotificationSettingsTab() {
  const [status, setStatus] = useState<NotifStatus | null>(null)
  const [config, setConfig] = useState<NotifConfig>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<'WHATSAPP' | 'EMAIL' | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchStatus = useCallback(async () => {
    const r = await fetch('/api/v1/settings/notifications/status')
      .then((res) => res.json())
      .catch(() => null)
    if (r?.data) setStatus(r.data)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/settings/notifications/status').then((r) => r.json()),
      fetch('/api/v1/settings/notifications').then((r) => r.json()),
    ])
      .then(([statusRes, configRes]) => {
        if (statusRes?.data) setStatus(statusRes.data)
        if (configRes?.data) {
          const d = configRes.data
          setConfig({
            evolutionApiUrl: d.evolutionApiUrl ?? '',
            evolutionApiKey: d.evolutionApiKey ?? '',
            evolutionInstanceName: d.evolutionInstanceName ?? 'vetcare',
            resendApiKey: d.resendApiKey ?? '',
            resendFromEmail: d.resendFromEmail ?? '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Polling quando aguardando QR code
  useEffect(() => {
    if (status?.whatsapp?.status !== 'qr_code') return
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [status?.whatsapp?.status, fetchStatus])

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch('/api/v1/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (r.ok) {
        setMsg({ type: 'success', text: 'Configurações salvas!' })
        fetchStatus()
      } else {
        setMsg({ type: 'error', text: 'Erro ao salvar configurações' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleConnect() {
    await fetchStatus()
    setStatus((s) => (s ? { ...s, whatsapp: { ...s.whatsapp, status: 'qr_code' } } : s))
  }

  async function handleDisconnect() {
    await fetch('/api/v1/settings/notifications/whatsapp/disconnect', { method: 'DELETE' })
    fetchStatus()
  }

  async function handleTest(channel: 'WHATSAPP' | 'EMAIL') {
    setTesting(channel)
    setMsg(null)
    try {
      const r = await fetch('/api/v1/settings/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      })
      const d = await r.json()
      if (r.ok) {
        setMsg({
          type: 'success',
          text: `Mensagem de teste enviada via ${channel === 'WHATSAPP' ? 'WhatsApp' : 'E-mail'}!`,
        })
      } else {
        setMsg({ type: 'error', text: d.error?.message ?? 'Erro no envio de teste' })
      }
    } finally {
      setTesting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const waStatus = status?.whatsapp?.status ?? 'unavailable'
  const waConnected = waStatus === 'connected'
  const waQR = waStatus === 'qr_code'

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {msg.text}
        </div>
      )}

      {/* WhatsApp Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-800">WhatsApp (Evolution API)</h3>
        </div>

        {/* Status card */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            {waConnected ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">
                {waConnected
                  ? 'Conectado'
                  : waQR
                  ? 'Aguardando escaneamento...'
                  : 'Desconectado'}
              </p>
              {waQR && (
                <p className="text-xs text-amber-600">Escaneie o QR code com seu WhatsApp</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                waConnected
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }
            >
              {waConnected ? 'Ativo' : 'Inativo'}
            </Badge>
            {waConnected ? (
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Desconectar
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnect}>
                Conectar
              </Button>
            )}
          </div>
        </div>

        {/* QR Code */}
        {waQR && <WhatsAppQRCode onConnected={fetchStatus} />}

        {/* Config fields */}
        <div className="grid gap-3">
          {(
            [
              { label: 'URL da API', key: 'evolutionApiUrl', placeholder: 'http://localhost:8080', type: 'text' },
              { label: 'API Key', key: 'evolutionApiKey', placeholder: 'sua-chave-secreta', type: 'password' },
              { label: 'Nome da instância', key: 'evolutionInstanceName', placeholder: 'vetcare', type: 'text' },
            ] as const
          ).map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={(config as Record<string, string>)[key] ?? ''}
                onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {waConnected && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={testing === 'WHATSAPP'}
            onClick={() => handleTest('WHATSAPP')}
          >
            <Send className="w-3 h-3" />
            {testing === 'WHATSAPP' ? 'Enviando...' : 'Testar WhatsApp'}
          </Button>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Email Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">E-mail (Resend)</h3>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            {status?.email?.configured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">
                {status?.email?.configured ? 'Configurado' : 'Não configurado'}
              </p>
              {status?.email?.fromEmail && (
                <p className="text-xs text-gray-500">{status.email.fromEmail}</p>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              status?.email?.configured
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }
          >
            {status?.email?.configured ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="grid gap-3">
          {(
            [
              {
                label: 'Resend API Key',
                key: 'resendApiKey',
                placeholder: 're_xxxxxxxxxxxx',
                type: 'password',
              },
              {
                label: 'E-mail de origem',
                key: 'resendFromEmail',
                placeholder: 'noreply@rastaful.dev',
                type: 'text',
              },
            ] as const
          ).map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={(config as Record<string, string>)[key] ?? ''}
                onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {status?.email?.configured && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={testing === 'EMAIL'}
            onClick={() => handleTest('EMAIL')}
          >
            <Send className="w-3 h-3" />
            {testing === 'EMAIL' ? 'Enviando...' : 'Testar E-mail'}
          </Button>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Dica: Para migrar o agendador automático para um serviço externo, chame
        <br />
        <code className="bg-gray-100 px-1 rounded">
          GET /api/cron/notifications?secret=CRON_SECRET
        </code>
      </p>
    </div>
  )
}
