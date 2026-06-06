'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageCircle, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react'

type Channel = 'WHATSAPP' | 'EMAIL' | 'AUTO'

interface Props {
  tutorId: string
  animalId: string
  type: 'CONSULTATION_REMINDER' | 'VACCINATION_REMINDER' | 'RETURN_REMINDER'
  vars: Record<string, string>
  onClose: () => void
}

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION_REMINDER: 'Lembrete de Consulta',
  VACCINATION_REMINDER: 'Lembrete de Vacinação',
  RETURN_REMINDER: 'Lembrete de Retorno',
}

const CHANNEL_OPTIONS: { id: Channel; label: string; icon: React.ElementType }[] = [
  { id: 'AUTO', label: 'Automático (WhatsApp → E-mail)', icon: Send },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
  { id: 'EMAIL', label: 'E-mail', icon: Mail },
]

function buildPreview(
  type: Props['type'],
  vars: Record<string, string>
): string {
  if (type === 'CONSULTATION_REMINDER') {
    return [
      '🐾 VetCare — Lembrete de Consulta',
      '',
      `Olá ${vars.tutorName}!`,
      '',
      `Sua consulta com ${vars.animalName} está agendada para:`,
      `📅 ${vars.date}${vars.time ? ` às ${vars.time}` : ''}${vars.address ? `\n📍 ${vars.address}` : ''}`,
      '',
      `_${vars.vetName}_`,
    ].join('\n')
  }
  if (type === 'VACCINATION_REMINDER') {
    return [
      '🐾 VetCare — Lembrete de Vacinação',
      '',
      `Olá ${vars.tutorName}!`,
      '',
      `A vacina ${vars.vaccine ?? ''} de ${vars.animalName} vence em:`,
      `📅 ${vars.date}`,
      '',
      `_${vars.vetName}_`,
    ].join('\n')
  }
  return [
    '🐾 VetCare — Lembrete de Retorno',
    '',
    `Olá ${vars.tutorName}!`,
    '',
    `O retorno de ${vars.animalName} está previsto para:`,
    `📅 ${vars.date}`,
    '',
    `_${vars.vetName}_`,
  ].join('\n')
}

export function SendReminderModal({ tutorId, animalId, type, vars, onClose }: Props) {
  const [channel, setChannel] = useState<Channel>('AUTO')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ status: 'success' | 'error'; text: string } | null>(null)

  const preview = buildPreview(type, vars)

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const r = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, animalId, type, channel, vars }),
      })
      const d = await r.json()
      if (r.ok) {
        setResult({ status: 'success', text: `Enviado via ${d.data?.channel ?? channel}!` })
        setTimeout(onClose, 1500)
      } else {
        setResult({ status: 'error', text: d.error?.message ?? 'Erro ao enviar' })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar {TYPE_LABELS[type]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview da mensagem */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Preview da mensagem:</p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line border border-gray-200 font-mono text-xs leading-relaxed">
              {preview}
            </div>
          </div>

          {/* Seleção de canal */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Canal de envio:</p>
            <div className="space-y-2">
              {CHANNEL_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setChannel(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    channel === id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.status === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {result.status === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {result.text}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : 'Enviar agora'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
