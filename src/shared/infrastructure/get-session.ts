import { auth } from '@/lib/auth'
import { ForbiddenError } from './errors'

export interface AuthSession {
  userId: string
  tenantId: string
  role: string
  email: string
  name: string
}

export async function getAuthSession(): Promise<AuthSession> {
  const session = await auth()

  if (!session?.user) {
    throw new ForbiddenError('Não autenticado')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any

  if (!user.tenantId) {
    throw new ForbiddenError('Tenant não encontrado')
  }

  return {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role ?? 'VETERINARIAN',
    email: user.email ?? '',
    name: user.name ?? '',
  }
}
