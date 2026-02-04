import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/logout-button'
import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/admin/sidebar'
import { SearchBar } from '@/components/search/search-bar'

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
        <div className="flex">
          {/* Sidebar navigation */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 md:ml-0">
            <header className="border-b bg-white px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Spacer for mobile hamburger */}
                <div className="w-8 md:hidden" />
                <h1 className="hidden text-xl font-semibold text-gray-900 md:block">
                  Junpa Admin
                </h1>
                <div className="flex-1 flex justify-center md:justify-start md:ml-6">
                  <SearchBar />
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden text-sm text-gray-600 sm:inline">
                    {session.user?.name}
                  </span>
                  <LogoutButton />
                </div>
              </div>
            </header>
            <main className="p-6">{children}</main>
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}
