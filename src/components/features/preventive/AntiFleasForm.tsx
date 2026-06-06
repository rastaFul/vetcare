'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApplyAntiFleasSchema, COMMON_ANTI_FLEAS } from '@/modules/preventive/application/dtos/PreventiveDTO'
import { z } from 'zod'

type FormInput = z.input<typeof ApplyAntiFleasSchema>
type FormOutput = z.output<typeof ApplyAntiFleasSchema>

interface Props {
  animalId: string
  onSubmit: (data: FormOutput) => Promise<void>
  onCancel: () => void
}

export function AntiFleasForm({ animalId, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(ApplyAntiFleasSchema),
    defaultValues: { animalId, createReminder: false },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('animalId')} />

      <div>
        <label className="block text-sm font-medium mb-1">Antipulgas</label>
        <input
          list="antifleas-list"
          {...register('medication')}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: Frontline, NexGard..."
        />
        <datalist id="antifleas-list">
          {COMMON_ANTI_FLEAS.map((v) => <option key={v} value={v} />)}
        </datalist>
        {errors.medication && <p className="text-red-500 text-xs mt-1">{errors.medication.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data de Aplicação</label>
        <input type="date" {...register('appliedAt')} className="w-full border rounded px-3 py-2" />
        {errors.appliedAt && <p className="text-red-500 text-xs mt-1">{errors.appliedAt.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Próxima Aplicação</label>
        <input type="date" {...register('nextApplicationAt')} className="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea {...register('observations')} className="w-full border rounded px-3 py-2" rows={2} />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
