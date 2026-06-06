import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layouts/Sidebar'
import { Header } from '@/components/layouts/Header'
import { BottomNav } from '@/components/layouts/BottomNav'
import { SessionProvider } from '@/components/layouts/SessionProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        </div>
        <BottomNav />
      </div>
    </SessionProvider>
  )
}
