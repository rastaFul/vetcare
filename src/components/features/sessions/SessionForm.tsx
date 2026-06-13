'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  clientId: z.string().uuid('Selecione um cliente'),
  serviceId: z.string().uuid().optional().or(z.literal('')),
  scheduledAt: z.string().min(1, 'Data obrigatória'),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
})

export type SessionFormValues = z.infer<typeof schema>

interface Client { id: string; name: string }
interface Service { id: string; name: string; durationMin: number; price: number }

interface SessionFormProps {
  defaultClientId?: string
  defaultValues?: Partial<SessionFormValues>
  onSubmit: (data: SessionFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SessionForm({ defaultClientId, defaultValues, onSubmit, onCancel, isLoading }: SessionFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<SessionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clientId: defaultClientId, ...defaultValues },
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/clients?pageSize=100').then((r) => r.json()),
      fetch('/api/v1/services?active=true').then((r) => r.json()),
    ]).then(([c, s]) => {
      setClients(c.data ?? [])
      setServices(s.data ?? [])
    })
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Cliente *</Label>
        <select
          {...register('clientId')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione um cliente</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId.message}</p>}
      </div>

      <div>
        <Label>Serviço</Label>
        <select
          {...register('serviceId')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sem serviço específico</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.durationMin}min — R$ {s.price.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Data e Hora *</Label>
        <Input type="datetime-local" {...register('scheduledAt')} />
        {errors.scheduledAt && <p className="text-xs text-red-500 mt-1">{errors.scheduledAt.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <Label>Logradouro</Label>
          <Input {...register('street')} placeholder="Rua, Av." />
        </div>
        <div>
          <Label>Número</Label>
          <Input {...register('number')} placeholder="123" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Bairro</Label>
          <Input {...register('neighborhood')} />
        </div>
        <div>
          <Label>Cidade</Label>
          <Input {...register('city')} />
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea {...register('notes')} placeholder="Observações sobre a sessão" rows={3} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Agendando...' : 'Agendar'}
        </Button>
      </div>
    </form>
  )
}
