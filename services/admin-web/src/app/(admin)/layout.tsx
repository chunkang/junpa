import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'
import { SessionProvider } from 'next-auth/react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Junpa Admin
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.name}
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </SessionProvider>
  )
}
