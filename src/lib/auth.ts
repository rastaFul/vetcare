import NextAuth from 'next-auth'
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
          scope: 'openid email profile',
        },
      },
    }),
  ],
  // JWT: middleware valida sem precisar de Prisma no Edge Runtime
  session: { strategy: 'jwt' },
  callbacks: {
    // jwt: cria/atualiza o token
    async jwt({ token, user }) {
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
          token.professionType = 'VETERINARIAN'
        } else {
          token.tenantId = dbUser.tenantId
          token.role = dbUser.role
          // Load professionType from tenant
          const tenant = await prisma.tenant.findUnique({
            where: { id: dbUser.tenantId },
            select: { professionType: true },
          })
          token.professionType = tenant?.professionType ?? 'VETERINARIAN'
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
        const u = session.user as any
        u.tenantId = token.tenantId
        u.role = token.role
        u.professionType = token.professionType ?? 'VETERINARIAN'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
