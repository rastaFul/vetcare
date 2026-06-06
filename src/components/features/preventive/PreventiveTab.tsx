'use client'

import { useState } from 'react'
import { VaccinationForm } from './VaccinationForm'
import { DewormingForm } from './DewormingForm'
import { AntiFleasForm } from './AntiFleasForm'
import { ApplyVaccinationInput, ApplyDewormingInput, ApplyAntiFleasInput } from '@/modules/preventive/application/dtos/PreventiveDTO'

interface Props {
  animalId: string
}

type Section = 'vaccinations' | 'dewormings' | 'antifleas'
type FormOpen = Section | null

export function PreventiveTab({ animalId }: Props) {
  const [formOpen, setFormOpen] = useState<FormOpen>(null)
  const [vaccinations, setVaccinations] = useState<unknown[]>([])
  const [dewormings, setDewormings] = useState<unknown[]>([])
  const [antiFleas, setAntiFleas] = useState<unknown[]>([])

  async function handleVaccinationSubmit(data: ApplyVaccinationInput) {
    const res = await fetch(`/api/v1/animals/${animalId}/vaccinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { data: record } = await res.json()
      setVaccinations((prev) => [record, ...prev])
      setFormOpen(null)
    }
  }

  async function handleDewormingSubmit(data: ApplyDewormingInput) {
    const res = await fetch(`/api/v1/animals/${animalId}/dewormings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { data: record } = await res.json()
      setDewormings((prev) => [record, ...prev])
      setFormOpen(null)
    }
  }

  async function handleAntiFleasSubmit(data: ApplyAntiFleasInput) {
    const res = await fetch(`/api/v1/animals/${animalId}/antifleas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { data: record } = await res.json()
      setAntiFleas((prev) => [record, ...prev])
      setFormOpen(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Vacinações */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Vacinações</h3>
          <button
            onClick={() => setFormOpen(formOpen === 'vaccinations' ? null : 'vaccinations')}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Adicionar
          </button>
        </div>
        {formOpen === 'vaccinations' && (
          <div className="border rounded p-4 mb-3">
            <VaccinationForm
              animalId={animalId}
              onSubmit={handleVaccinationSubmit}
              onCancel={() => setFormOpen(null)}
            />
          </div>
        )}
        {vaccinations.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma vacinação registrada.</p>
        ) : (
          <ul className="space-y-2">
            {vaccinations.map((v: unknown, i) => {
              const vac = v as { id: string; vaccine: string; appliedAt: string }
              return (
                <li key={vac.id ?? i} className="border rounded p-3 text-sm">
                  <span className="font-medium">{vac.vaccine}</span> — {new Date(vac.appliedAt).toLocaleDateString('pt-BR')}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Vermifugações */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Vermifugações</h3>
          <button
            onClick={() => setFormOpen(formOpen === 'dewormings' ? null : 'dewormings')}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Adicionar
          </button>
        </div>
        {formOpen === 'dewormings' && (
          <div className="border rounded p-4 mb-3">
            <DewormingForm
              animalId={animalId}
              onSubmit={handleDewormingSubmit}
              onCancel={() => setFormOpen(null)}
            />
          </div>
        )}
        {dewormings.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma vermifugação registrada.</p>
        ) : (
          <ul className="space-y-2">
            {dewormings.map((d: unknown, i) => {
              const dew = d as { id: string; medication: string; appliedAt: string }
              return (
                <li key={dew.id ?? i} className="border rounded p-3 text-sm">
                  <span className="font-medium">{dew.medication}</span> — {new Date(dew.appliedAt).toLocaleDateString('pt-BR')}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Antipulgas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Antipulgas</h3>
          <button
            onClick={() => setFormOpen(formOpen === 'antifleas' ? null : 'antifleas')}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Adicionar
          </button>
        </div>
        {formOpen === 'antifleas' && (
          <div className="border rounded p-4 mb-3">
            <AntiFleasForm
              animalId={animalId}
              onSubmit={handleAntiFleasSubmit}
              onCancel={() => setFormOpen(null)}
            />
          </div>
        )}
        {antiFleas.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma aplicação de antipulgas registrada.</p>
        ) : (
          <ul className="space-y-2">
            {antiFleas.map((a: unknown, i) => {
              const af = a as { id: string; medication: string; appliedAt: string }
              return (
                <li key={af.id ?? i} className="border rounded p-3 text-sm">
                  <span className="font-medium">{af.medication}</span> — {new Date(af.appliedAt).toLocaleDateString('pt-BR')}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
