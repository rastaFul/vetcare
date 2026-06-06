'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const FormSchema = z.object({
  anamnesis: z.string().min(1, 'Anamnese é obrigatória'),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  observations: z.string().optional(),
  returnDate: z.string().optional(),
  createReturnReminder: z.boolean(),
})

export type CompleteConsultationFormValues = z.infer<typeof FormSchema>

interface CompleteConsultationFormProps {
  onSubmit: (data: CompleteConsultationFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CompleteConsultationForm({
  onSubmit,
  onCancel,
  isLoading,
}: CompleteConsultationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteConsultationFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { createReturnReminder: false },
  })

  const createReturnReminder = watch('createReturnReminder')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="anamnesis">Anamnese *</Label>
        <Textarea
          id="anamnesis"
          className="mt-1"
          rows={4}
          placeholder="Descrição do quadro clínico apresentado pelo animal..."
          {...register('anamnesis')}
        />
        {errors.anamnesis && (
          <p className="text-xs text-red-500 mt-1">{errors.anamnesis.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Textarea
          id="diagnosis"
          className="mt-1"
          rows={3}
          placeholder="Diagnóstico clínico..."
          {...register('diagnosis')}
        />
        {errors.diagnosis && (
          <p className="text-xs text-red-500 mt-1">{errors.diagnosis.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          className="mt-1"
          rows={2}
          placeholder="Observações adicionais..."
          {...register('observations')}
        />
      </div>

      <div>
        <Label htmlFor="returnDate">Data de Retorno</Label>
        <Input
          id="returnDate"
          type="datetime-local"
          className="mt-1"
          {...register('returnDate')}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="createReturnReminder"
          className="w-4 h-4"
          checked={createReturnReminder}
          onChange={e => setValue('createReturnReminder', e.target.checked)}
        />
        <Label htmlFor="createReturnReminder" className="cursor-pointer">
          Criar lembrete de retorno no Google Calendar
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700">
          {isLoading ? 'Salvando...' : 'Concluir Consulta'}
        </Button>
      </div>
    </form>
  )
}
