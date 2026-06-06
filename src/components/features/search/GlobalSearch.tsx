'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, User, PawPrint, X } from 'lucide-react'

const SPECIES_LABELS: Record<string, string> = {
  DOG: 'Cão',
  CAT: 'Gato',
  BIRD: 'Ave',
  RABBIT: 'Coelho',
  HAMSTER: 'Hamster',
  OTHER: 'Outro',
}

interface TutorResult {
  id: string
  name: string
  phone: string
}

interface AnimalResult {
  id: string
  name: string
  species: string
  tutor: { name: string }
}

interface SearchResults {
  tutors: TutorResult[]
  animals: AnimalResult[]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ tutors: [], animals: [] })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ tutors: [], animals: [] })
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ tutors: [], animals: [] })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const body = await res.json()
        setResults(body.data ?? { tutors: [], animals: [] })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  const hasResults = results.tutors.length > 0 || results.animals.length > 0

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors w-full max-w-sm"
          aria-label="Busca global"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="text-xs bg-white border border-gray-200 rounded px-1 py-0.5 font-sans hidden sm:block">
            ⌘K
          </kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[15%] z-50 w-full max-w-md -translate-x-1/2 rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
          <Dialog.Title className="sr-only">Busca global</Dialog.Title>

          {/* Search input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tutores, animais..."
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <Dialog.Close asChild>
              <button className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-1.5 py-0.5 ml-1">
                Esc
              </button>
            </Dialog.Close>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-gray-400">Buscando...</div>
            )}

            {!loading && query.length >= 2 && !hasResults && (
              <div className="p-8 text-center text-sm text-gray-400">
                Nenhum resultado para &quot;{query}&quot;
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="p-4 text-center text-sm text-gray-400">
                Digite pelo menos 2 caracteres para buscar
              </div>
            )}

            {!loading && results.tutors.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                  Tutores
                </p>
                {results.tutors.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/tutores/${t.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && results.animals.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                  Animais
                </p>
                {results.animals.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/animais/${a.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <PawPrint className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                      <p className="text-xs text-gray-500">
                        {SPECIES_LABELS[a.species] ?? a.species}
                        {a.tutor?.name ? ` — ${a.tutor.name}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
