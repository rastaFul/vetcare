'use client'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  onConnected: () => void
}

export function WhatsAppQRCode({ onConnected }: Props) {
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      try {
        const connectRes = await fetch('/api/v1/settings/notifications/whatsapp/qrcode')
        if (!mounted) return
        const data = await connectRes.json()
        if (data?.data?.qrcode) {
          setQrBase64(data.data.qrcode)
        } else if (data?.data?.connected) {
          onConnected()
          return
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    poll()

    const interval = setInterval(async () => {
      const r = await fetch('/api/v1/settings/notifications/whatsapp/qrcode')
        .then((res) => res.json())
        .catch(() => null)
      if (!mounted) return
      if (r?.data?.qrcode) setQrBase64(r.data.qrcode)
      if (r?.data?.connected) {
        onConnected()
        clearInterval(interval)
      }
    }, 5000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [onConnected])

  if (loading) {
    return <Skeleton className="w-48 h-48 mx-auto rounded-xl" />
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      {qrBase64 ? (
        <img
          src={`data:image/png;base64,${qrBase64}`}
          alt="QR Code WhatsApp"
          className="w-48 h-48 rounded-lg"
        />
      ) : (
        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center px-4">Aguardando QR code...</p>
        </div>
      )}
      <p className="text-sm text-gray-600 text-center max-w-xs">
        Abra o <strong>WhatsApp</strong> no celular →{' '}
        <strong>Dispositivos conectados</strong> → <strong>Conectar dispositivo</strong>
      </p>
    </div>
  )
}
