'use client'

import { useState, useEffect } from 'react'
import { AttachmentIcon } from './AttachmentIcon'
import { FileUploader } from './FileUploader'
import { ATTACHMENT_TYPE_LABELS } from '@/modules/documents/application/dtos/AttachmentDTO'
import { Download, Trash2 } from 'lucide-react'

interface AttachmentDTO {
  id: string
  type: string
  name: string
  mimeType: string
  fileSizeFormatted: string
  isImage: boolean
  isPdf: boolean
  createdAt: string
  storageKey: string
}

interface Props {
  animalId: string
}

export function AttachmentsTab({ animalId }: Props) {
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([])
  const [showUploader, setShowUploader] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/animals/${animalId}/attachments`)
      if (res.ok) {
        const { data } = await res.json()
        setAttachments(data ?? [])
      }
    }
    load()
  }, [animalId])

  function handleUploaded(attachment: unknown) {
    setAttachments((prev) => [attachment as AttachmentDTO, ...prev])
    setShowUploader(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirmar exclusão do arquivo?')) return
    const res = await fetch(`/api/v1/attachments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAttachments((prev) => prev.filter((a) => a.id !== id))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Documentos e Arquivos</h3>
        <button
          onClick={() => setShowUploader((v) => !v)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
        >
          {showUploader ? 'Fechar' : '+ Adicionar'}
        </button>
      </div>

      {showUploader && (
        <div className="border rounded p-4 mb-4">
          <FileUploader animalId={animalId} onUploaded={handleUploaded} />
        </div>
      )}

      {attachments.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum arquivo anexado.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 border rounded p-3">
              <AttachmentIcon type={a.type} mimeType={a.mimeType} className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-xs text-gray-500">
                  {ATTACHMENT_TYPE_LABELS[a.type] ?? a.type} — {a.fileSizeFormatted}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a
                  href={`/api/v1/attachments/${a.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
