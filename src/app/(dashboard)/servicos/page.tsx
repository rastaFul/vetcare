'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Briefcase, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ServiceItem {
  id: string
  name: string
  durationMin: number
  price: number
  description?: string
  active: boolean
  sortOrder: number
}

export default function ServicosPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ServiceItem | null>(null)
  const [formData, setFormData] = useState({ name: '', durationMin: 60, price: 0, description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/services?active=false')
      const body = await res.json()
      setServices(body.data ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const openEdit = (s: ServiceItem) => {
    setEditing(s)
    setFormData({ name: s.name, durationMin: s.durationMin, price: s.price, description: s.description ?? '' })
    setShowForm(true)
  }

  const openNew = () => {
    setEditing(null)
    setFormData({ name: '', durationMin: 60, price: 0, description: '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/v1/services/${editing.id}` : '/api/v1/services'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: Number(formData.price), durationMin: Number(formData.durationMin) }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.message ?? 'Erro ao salvar')
        return
      }
      setShowForm(false)
      fetchServices()
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (s: ServiceItem) => {
    await fetch(`/api/v1/services/${s.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    })
    fetchServices()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500 mt-1">Catálogo de serviços oferecidos</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum serviço cadastrado</h3>
          <p className="text-sm text-gray-500 mb-6">Adicione os tipos de massagem que você oferece.</p>
          <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" />Adicionar Serviço</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${!s.active ? 'opacity-60' : 'border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  {!s.active && <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400">Inativo</Badge>}
                </div>
                <p className="text-sm text-gray-500">
                  {s.durationMin} min — R$ {s.price.toFixed(2)}
                  {s.description ? ` — ${s.description}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(s)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {s.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            {error && <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))} placeholder="ex: Massagem Relaxante" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duração (min) *</Label>
                  <Input type="number" value={formData.durationMin} onChange={(e) => setFormData((d) => ({ ...d, durationMin: Number(e.target.value) }))} min={15} max={480} />
                </div>
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData((d) => ({ ...d, price: Number(e.target.value) }))} min={0} />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving} className="flex-1">Cancelar</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
