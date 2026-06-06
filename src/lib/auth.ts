import NextAuth from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
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
  // JWT: middleware valida sem precisar de Prisma no Edge Runtime
  session: { strategy: 'jwt' },
  callbacks: {
    // jwt: cria/atualiza o token
    async jwt({ token, user, account }) {
      if (user?.id) {
        // Primeiro login: user vem do adapter (acaba de ser criado no DB)
        token.sub = user.id

        // Buscar/criar tenant para o usuário
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { tenantId: true, role: true },
        })

        const updateData: Record<string, unknown> = {}

        if (!dbUser?.tenantId) {
          // Criar tenant
          const email = user.email ?? token.email ?? ''
          const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
          const tenant = await prisma.tenant.create({
            data: { name: 'Minha Clínica', slug: `${slug}-${Date.now()}` },
          })
          updateData.tenantId = tenant.id
          updateData.role = 'OWNER'
          token.tenantId = tenant.id
          token.role = 'OWNER'
        } else {
          token.tenantId = dbUser.tenantId
          token.role = dbUser.role
        }

        // Salvar access_token do Google Calendar (já tem scope calendar.events)
        if (account?.access_token) {
          updateData.googleCalendarToken = account.access_token
          token.calendarConnected = true
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })
        }
      }
      return token
    },

    // session: expõe dados do token para o cliente
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).tenantId = token.tenantId
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
