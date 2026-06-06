'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

const FormSchema = z.object({
  tutorId: z.string().uuid('Selecione um tutor'),
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  species: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER']),
  breed: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  birthDate: z.string().optional(),
  weightKg: z.string().optional(),
  color: z.string().optional(),
  castrated: z.boolean(),
  microchip: z.string().optional(),
  notes: z.string().optional(),
})

export type AnimalFormValues = z.infer<typeof FormSchema>

interface TutorOption {
  id: string
  name: string
}

interface AnimalFormProps {
  defaultValues?: Partial<AnimalFormValues>
  onSubmit: (data: AnimalFormValues, photoFile?: File) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  fixedTutorId?: string
}

export function AnimalForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  fixedTutorId,
}: AnimalFormProps) {
  const [tutors, setTutors] = useState<TutorOption[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnimalFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sex: 'UNKNOWN',
      castrated: false,
      ...defaultValues,
      tutorId: fixedTutorId ?? defaultValues?.tutorId,
    },
  })

  useEffect(() => {
    fetch('/api/v1/tutors?pageSize=100')
      .then((r) => r.json())
      .then((body) => setTutors(body.data ?? []))
      .catch(() => {})
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleFormSubmit = async (data: AnimalFormValues) => {
    await onSubmit(data, photoFile ?? undefined)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {photoPreview ? (
            <Image src={photoPreview} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 text-center leading-tight px-1">Foto do animal</span>
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {photoPreview ? 'Trocar foto' : 'Adicionar foto'}
          </Button>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG ou WebP. Máx 5MB.</p>
        </div>
      </div>

      {/* Tutor */}
      {!fixedTutorId && (
        <div>
          <Label htmlFor="tutorId">
            Tutor <span className="text-red-500">*</span>
          </Label>
          <select
            id="tutorId"
            {...register('tutorId')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione um tutor...</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.tutorId && <p className="text-xs text-red-500 mt-1">{errors.tutorId.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">
            Nome <span className="text-red-500">*</span>
          </Label>
          <Input id="name" {...register('name')} placeholder="Nome do animal" className="mt-1" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="species">
            Espécie <span className="text-red-500">*</span>
          </Label>
          <select
            id="species"
            {...register('species')}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione...</option>
            <option value="DOG">Cão</option>
            <option value="CAT">Gato</option>
            <option value="BIRD">Pássaro</option>
            <option value="RABBIT">Coelho</option>
            <option value="REPTILE">Réptil</option>
            <option value="OTHER">Outro</option>
          </select>
          {errors.species && <p className="text-xs text-red-500 mt-1">{errors.species.message}</p>}
        </div>

        <div>
          <Label htmlFor="breed">Raça</Label>
          <Input id="breed" {...register('breed')} placeholder="Ex: Labrador" className="mt-1" />
        </div>

        <div>
          <Label>Sexo</Label>
          <div className="flex gap-4 mt-2">
            {(['MALE', 'FEMALE', 'UNKNOWN'] as const).map((val) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="radio" value={val} {...register('sex')} />
                {val === 'MALE' ? 'Macho' : val === 'FEMALE' ? 'Fêmea' : 'Não informado'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input id="birthDate" type="date" {...register('birthDate')} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="weightKg">Peso (kg)</Label>
          <Input
            id="weightKg"
            type="number"
            step="0.1"
            min="0"
            {...register('weightKg')}
            placeholder="Ex: 8.5"
            className="mt-1"
          />
          {errors.weightKg && <p className="text-xs text-red-500 mt-1">{errors.weightKg.message}</p>}
        </div>

        <div>
          <Label htmlFor="color">Cor / pelagem</Label>
          <Input id="color" {...register('color')} placeholder="Ex: Caramelo" className="mt-1" />
        </div>

        <div>
          <Label htmlFor="microchip">Microchip</Label>
          <Input id="microchip" {...register('microchip')} placeholder="Número do microchip" className="mt-1" />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id="castrated"
            type="checkbox"
            {...register('castrated')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="castrated" className="cursor-pointer">
            Castrado(a)
          </Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Informações adicionais sobre o animal..."
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
