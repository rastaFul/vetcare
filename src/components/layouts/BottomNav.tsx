'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LayoutDashboard, Users, PawPrint, Stethoscope, Settings, Calendar, Briefcase } from 'lucide-react'

const vetNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutores', label: 'Tutores', icon: Users },
  { href: '/animais', label: 'Animais', icon: PawPrint },
  { href: '/consultas', label: 'Consultas', icon: Stethoscope },
  { href: '/configuracoes', label: 'Config', icon: Settings },
]

const massageNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/servicos', label: 'Serviços', icon: Briefcase },
  { href: '/configuracoes', label: 'Config', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const professionType = (session?.user as any)?.professionType ?? 'VETERINARIAN'
  const navItems = professionType === 'MASSAGE_THERAPIST' ? massageNavItems : vetNavItems

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
