// Configuração de auth compatível com Edge Runtime (sem Prisma adapter)
// Usada pelo middleware e pelo NextAuth para providers/callbacks básicos
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath =
        nextUrl.pathname.startsWith('/api/auth') ||
        nextUrl.pathname === '/login' ||
        nextUrl.pathname === '/api/health' ||
        nextUrl.pathname === '/privacidade' ||
        nextUrl.pathname === '/termos' ||
        nextUrl.pathname.startsWith('/_next') ||
        nextUrl.pathname.startsWith('/favicon')

      if (isPublicPath) return true
      if (isLoggedIn) return true

      return false // Redireciona para /login
    },
  },
}
