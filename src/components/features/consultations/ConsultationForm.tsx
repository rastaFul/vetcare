'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const FormSchema = z.object({
  animalId: z.string().uuid('Selecione um animal'),
  scheduledAt: z.string().min(1, 'Data e hora são obrigatórias'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  observations: z.string().optional(),
  createCalendarEvent: z.boolean(),
})

export type ConsultationFormValues = z.infer<typeof FormSchema>

interface AnimalOption {
  id: string
  name: string
  species: string
  tutorName?: string
}

interface ConsultationFormProps {
  defaultValues?: Partial<ConsultationFormValues>
  onSubmit: (data: ConsultationFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  fixedAnimalId?: string
}

export function ConsultationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  fixedAnimalId,
}: ConsultationFormProps) {
  const [animals, setAnimals] = useState<AnimalOption[]>([])
  const [searchAnimal, setSearchAnimal] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      createCalendarEvent: true,
      ...defaultValues,
      ...(fixedAnimalId ? { animalId: fixedAnimalId } : {}),
    },
  })

  useEffect(() => {
    if (fixedAnimalId) return
    const timer = setTimeout(() => {
      fetch(`/api/v1/animals?search=${encodeURIComponent(searchAnimal)}&pageSize=10`)
        .then(r => r.json())
        .then(body => {
          setAnimals(
            (body.data ?? []).map((a: { id: string; name: string; species: string; tutor?: { name: string } }) => ({
              id: a.id,
              name: a.name,
              species: a.species,
              tutorName: a.tutor?.name,
            }))
          )
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [searchAnimal, fixedAnimalId])

  const createCalendarEvent = watch('createCalendarEvent')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Animal selector */}
      {!fixedAnimalId && (
        <div>
          <Label>Animal *</Label>
          <Input
            placeholder="Buscar animal..."
            value={searchAnimal}
            onChange={e => setSearchAnimal(e.target.value)}
            className="mt-1 mb-1"
          />
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            {...register('animalId')}
          >
            <option value="">Selecione um animal</option>
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} {a.tutorName ? `— Tutor: ${a.tutorName}` : ''}
              </option>
            ))}
          </select>
          {errors.animalId && (
            <p className="text-xs text-red-500 mt-1">{errors.animalId.message}</p>
          )}
        </div>
      )}

      {/* Date and time */}
      <div>
        <Label htmlFor="scheduledAt">Data e Hora *</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          className="mt-1"
          {...register('scheduledAt')}
        />
        {errors.scheduledAt && (
          <p className="text-xs text-red-500 mt-1">{errors.scheduledAt.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="border border-gray-100 rounded-lg p-3 space-y-3">
        <p className="text-sm font-medium text-gray-700">Endereço do Atendimento</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" className="mt-1" {...register('street')} />
          </div>
          <div>
            <Label htmlFor="number">Número</Label>
            <Input id="number" className="mt-1" {...register('number')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" className="mt-1" {...register('neighborhood')} />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" className="mt-1" {...register('city')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input id="state" maxLength={2} className="mt-1" {...register('state')} />
          </div>
          <div>
            <Label htmlFor="zipCode">CEP</Label>
            <Input id="zipCode" className="mt-1" {...register('zipCode')} />
          </div>
        </div>
        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input id="complement" className="mt-1" {...register('complement')} />
        </div>
      </div>

      {/* Observations */}
      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea id="observations" className="mt-1" rows={3} {...register('observations')} />
      </div>

      {/* Google Calendar toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="createCalendarEvent"
          className="w-4 h-4"
          checked={createCalendarEvent}
          onChange={e => setValue('createCalendarEvent', e.target.checked)}
        />
        <Label htmlFor="createCalendarEvent" className="cursor-pointer">
          Criar evento no Google Calendar
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Salvando...' : 'Agendar Consulta'}
        </Button>
      </div>
    </form>
  )
}
