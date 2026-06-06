'use client'

import { useState, useEffect } from 'react'
import { PrescriptionDialog } from './PrescriptionDialog'

interface PrescriptionItem {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface Prescription {
  id: string
  diagnosis: string
  observations?: string
  items: PrescriptionItem[]
  pdfUrl?: string
  createdAt: string
}

interface Props {
  consultationId?: string
  animalId?: string
}

export function PrescriptionsTab({ consultationId, animalId }: Props) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  useEffect(() => {
    async function load() {
      let url = ''
      if (consultationId) {
        url = `/api/v1/consultations/${consultationId}/prescriptions`
      } else if (animalId) {
        url = `/api/v1/animals/${animalId}/prescriptions`
      }
      if (!url) return
      const res = await fetch(url)
      if (res.ok) {
        const { data } = await res.json()
        setPrescriptions(data ?? [])
      }
    }
    load()
  }, [consultationId, animalId])

  function handleCreated(prescription: unknown) {
    setPrescriptions((prev) => [prescription as Prescription, ...prev])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Receitas</h3>
        {consultationId && (
          <PrescriptionDialog consultationId={consultationId} onCreated={handleCreated} />
        )}
      </div>

      {prescriptions.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma receita registrada.</p>
      ) : (
        <ul className="space-y-3">
          {prescriptions.map((p) => (
            <li key={p.id} className="border rounded p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{p.diagnosis}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')} —{' '}
                    {p.items.length} item(s)
                  </p>
                </div>
                {p.pdfUrl && (
                  <a
                    href={p.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    PDF
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
