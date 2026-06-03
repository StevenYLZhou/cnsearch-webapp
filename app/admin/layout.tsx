import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="bg-amber-50 min-h-screen -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-amber-200 text-amber-800 text-xs font-semibold px-2 py-1 rounded">ADMIN</span>
          <span className="text-sm text-gray-600">{user.email}</span>
          <LogoutButton />
        </div>
        {children}
      </div>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST" className="ml-auto">
      <button type="submit" className="text-xs text-gray-400 hover:text-red-500 transition-colors">
        Sign out
      </button>
    </form>
  )
}
