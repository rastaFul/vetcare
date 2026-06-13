'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, Users, PawPrint, Stethoscope, Settings, LogOut, Calendar, Briefcase } from 'lucide-react'

const vetNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutores', label: 'Tutores', icon: Users },
  { href: '/animais', label: 'Animais', icon: PawPrint },
  { href: '/consultas', label: 'Consultas', icon: Stethoscope },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const massageNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/servicos', label: 'Serviços', icon: Briefcase },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const professionType = (session?.user as any)?.professionType ?? 'VETERINARIAN'
  const navItems = professionType === 'MASSAGE_THERAPIST' ? massageNavItems : vetNavItems

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-200 px-4 py-6">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-xl font-bold text-blue-600">VetCare</h1>
        <p className="text-xs text-gray-500 mt-1">Gestão Veterinária</p>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-blue-600" />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-gray-100 pt-4 mt-4">
        <button
          onClick={async () => {
            const { signOut } = await import('next-auth/react')
            await signOut({ callbackUrl: '/login' })
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
