'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePrescriptionSchema, CreatePrescriptionInput } from '@/modules/prescriptions/application/dtos/PrescriptionDTO'

interface Props {
  consultationId: string
  onSubmit: (data: CreatePrescriptionInput) => Promise<void>
  onCancel: () => void
}

export function PrescriptionForm({ consultationId, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePrescriptionInput>({
    resolver: zodResolver(CreatePrescriptionSchema),
    defaultValues: {
      consultationId,
      items: [{ medication: '', dosage: '', frequency: '', duration: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('consultationId')} />

      <div>
        <label className="block text-sm font-medium mb-1">Diagnóstico</label>
        <textarea
          {...register('diagnosis')}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
        {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{errors.diagnosis.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea {...register('observations')} className="w-full border rounded px-3 py-2" rows={2} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Itens da Receita</label>
          <button
            type="button"
            onClick={() => append({ medication: '', dosage: '', frequency: '', duration: '' })}
            className="text-sm text-blue-600 underline"
          >
            + Adicionar item
          </button>
        </div>

        {fields.map((field, idx) => (
          <div key={field.id} className="border rounded p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Item {idx + 1}</span>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(idx)} className="text-red-500 text-xs">
                  Remover
                </button>
              )}
            </div>
            <div>
              <input
                {...register(`items.${idx}.medication`)}
                placeholder="Medicamento"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                {...register(`items.${idx}.dosage`)}
                placeholder="Dose"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                {...register(`items.${idx}.frequency`)}
                placeholder="Frequência"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                {...register(`items.${idx}.duration`)}
                placeholder="Duração"
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <input
              {...register(`items.${idx}.instructions`)}
              placeholder="Instruções (opcional)"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        ))}
        {errors.items && <p className="text-red-500 text-xs">{errors.items.message}</p>}
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
          {isSubmitting ? 'Salvando...' : 'Criar Receita'}
        </button>
      </div>
    </form>
  )
}
