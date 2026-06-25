import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './_components/Sidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = user.user_metadata as Record<string, string>
  const displayName = meta?.full_name ?? meta?.name ?? user.email?.split('@')[0]
  const avatarUrl = meta?.avatar_url

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fffe' }}>
      <Sidebar displayName={displayName} avatarUrl={avatarUrl} />
      <main style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto', minWidth: 0, paddingBottom: '80px' }}>
        {children}
      </main>
    </div>
  )
}
