'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const FormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  cpf: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
})

export type TutorFormValues = z.infer<typeof FormSchema>

interface TutorFormProps {
  defaultValues?: Partial<TutorFormValues>
  onSubmit: (data: TutorFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TutorForm({ defaultValues, onSubmit, onCancel, isLoading }: TutorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TutorFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">
            Nome <span className="text-red-500">*</span>
          </Label>
          <Input id="name" {...register('name')} placeholder="Nome completo" className="mt-1" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" className="mt-1" />
          {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">
            Telefone <span className="text-red-500">*</span>
          </Label>
          <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" className="mt-1" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            {...register('whatsapp')}
            placeholder="(11) 99999-9999"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemplo.com"
            className="mt-1"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Endereço</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" {...register('street')} placeholder="Rua..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="number">Número</Label>
            <Input id="number" {...register('number')} placeholder="123" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              {...register('complement')}
              placeholder="Apto..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              {...register('neighborhood')}
              placeholder="Bairro"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              {...register('zipCode')}
              placeholder="00000-000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="São Paulo"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="SP"
              maxLength={2}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observações sobre o tutor..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
