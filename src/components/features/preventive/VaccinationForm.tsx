'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApplyVaccinationSchema, COMMON_VACCINES } from '@/modules/preventive/application/dtos/PreventiveDTO'
import { z } from 'zod'

type FormInput = z.input<typeof ApplyVaccinationSchema>
type FormOutput = z.output<typeof ApplyVaccinationSchema>

interface Props {
  animalId: string
  onSubmit: (data: FormOutput) => Promise<void>
  onCancel: () => void
}

export function VaccinationForm({ animalId, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(ApplyVaccinationSchema),
    defaultValues: { animalId, createReminder: false },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('animalId')} />

      <div>
        <label className="block text-sm font-medium mb-1">Vacina</label>
        <input
          list="vaccines-list"
          {...register('vaccine')}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: V10, Antirrábica..."
        />
        <datalist id="vaccines-list">
          {COMMON_VACCINES.map((v) => <option key={v} value={v} />)}
        </datalist>
        {errors.vaccine && <p className="text-red-500 text-xs mt-1">{errors.vaccine.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data de Aplicação</label>
        <input type="date" {...register('appliedAt')} className="w-full border rounded px-3 py-2" />
        {errors.appliedAt && <p className="text-red-500 text-xs mt-1">{errors.appliedAt.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Próxima Dose</label>
        <input type="date" {...register('nextDoseAt')} className="w-full border rounded px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Lote</label>
          <input {...register('batchNumber')} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fabricante</label>
          <input {...register('manufacturer')} className="w-full border rounded px-3 py-2" />
        </div>
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
