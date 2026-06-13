import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ClientCardProps {
  id: string
  name: string
  phone: string
  email?: string
  status: string
}

export function ClientCard({ id, name, phone, email, status }: ClientCardProps) {
  return (
    <Link
      href={`/clientes/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
        {status === 'INACTIVE' && (
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200 ml-2 flex-shrink-0">
            Inativo
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Phone className="w-3.5 h-3.5" />
          {phone}
        </div>
        {email && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{email}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
