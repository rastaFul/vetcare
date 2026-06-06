'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TutorCard } from '@/components/features/tutors/TutorCard'
import { TutorDialog } from '@/components/features/tutors/TutorDialog'
import { Skeleton } from '@/components/ui/skeleton'

interface TutorItem {
  id: string
  name: string
  phone: string
  email?: string
  cpf?: string
  status: string
  animalsCount?: number
}

interface Meta {
  total: number
  page: number
  pageSize: number
}

export default function TutoresPage() {
  const [tutors, setTutors] = useState<TutorItem[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pageSize: 20 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchTutors = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/v1/tutors?${params}`)
      const body = await res.json()
      setTutors(body.data ?? [])
      setMeta(body.meta ?? { total: 0, page: 1, pageSize: 20 })
    } catch {
      setTutors([])
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchTutors()
  }, [fetchTutors])

  const totalPages = Math.ceil(meta.total / meta.pageSize)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutores</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} tutores cadastrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Tutor
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nome, telefone ou email..."
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum tutor encontrado</h3>
          <p className="text-sm text-gray-500 mb-6">
            {search
              ? 'Tente ajustar os termos de busca.'
              : 'Comece cadastrando o primeiro tutor.'}
          </p>
          {!search && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar Tutor
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tutors.map((tutor) => (
              <TutorCard key={tutor.id} {...tutor} />
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

      <TutorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchTutors}
      />
    </div>
  )
}
