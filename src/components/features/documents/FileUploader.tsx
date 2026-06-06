'use client'

import { useRef, useState } from 'react'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/modules/documents/application/dtos/AttachmentDTO'

interface Props {
  animalId: string
  consultationId?: string
  onUploaded: (attachment: unknown) => void
}

export function FileUploader({ animalId, consultationId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setError(null)
    setPreview(null)
    setSelectedFile(null)

    if (!file) return

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou PDF.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB.')
      return
    }

    setSelectedFile(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    if (consultationId) formData.append('consultationId', consultationId)

    const res = await fetch(`/api/v1/animals/${animalId}/attachments`, {
      method: 'POST',
      body: formData,
    })

    setUploading(false)

    if (res.ok) {
      const { data } = await res.json()
      onUploaded(data)
      setSelectedFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    } else {
      setError('Erro ao fazer upload. Tente novamente.')
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="max-h-40 rounded border object-contain" />
      )}

      {selectedFile && !preview && (
        <p className="text-sm text-gray-600">{selectedFile.name}</p>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
      )}
    </div>
  )
}
