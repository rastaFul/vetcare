'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimalCard } from '@/components/features/animals/AnimalCard'
import { AnimalDialog } from '@/components/features/animals/AnimalDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { SPECIES_LABELS } from '@/modules/patients/application/dtos/AnimalDTO'

interface AnimalItem {
  id: string
  name: string
  species: string
  breed?: string
  tutorId: string
  tutorName?: string
  photoUrl?: string
  status: string
}

interface Meta {
  total: number
  page: number
  pageSize: number
}

export default function AnimaisPage() {
  const [animals, setAnimals] = useState<AnimalItem[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchAnimals = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
        status: 'ACTIVE',
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (speciesFilter) params.set('species', speciesFilter)

      const res = await fetch(`/api/v1/animals?${params}`)
      const body = await res.json()

      // Fetch tutor names for the returned animals
      const animalsData: AnimalItem[] = body.data ?? []

      // Get unique tutorIds and fetch names
      const tutorIds = [...new Set(animalsData.map((a) => a.tutorId))]
      if (tutorIds.length > 0) {
        try {
          const tutorRes = await fetch(`/api/v1/tutors?pageSize=100`)
          const tutorBody = await tutorRes.json()
          const tutorMap: Record<string, string> = {}
          for (const t of tutorBody.data ?? []) {
            tutorMap[t.id] = t.name
          }
          setAnimals(
            animalsData.map((a) => ({ ...a, tutorName: tutorMap[a.tutorId] }))
          )
        } catch {
          setAnimals(animalsData)
        }
      } else {
        setAnimals(animalsData)
      }

      setMeta(body.meta ?? { total: 0, page: 1, pageSize: 20 })
    } catch {
      setAnimals([])
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch, speciesFilter])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  const totalPages = Math.ceil(meta.total / meta.pageSize)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Animais</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} animais cadastrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Animal
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por nome..."
            className="pl-10"
          />
        </div>
        <select
          value={speciesFilter}
          onChange={(e) => {
            setSpeciesFilter(e.target.value)
            setPage(1)
          }}
          className="flex h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
        >
          <option value="">Todas as espécies</option>
          {Object.entries(SPECIES_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : animals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PawPrint className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum animal encontrado</h3>
          <p className="text-sm text-gray-500 mb-6">
            {search || speciesFilter
              ? 'Tente ajustar os filtros.'
              : 'Comece cadastrando o primeiro animal.'}
          </p>
          {!search && !speciesFilter && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar Animal
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {animals.map(({ tutorId: _tid, ...animal }) => (
              <AnimalCard key={animal.id} {...animal} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próximo
              </Button>
            </div>
          )}
        </>
      )}

      <AnimalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchAnimals}
      />
    </div>
  )
}
