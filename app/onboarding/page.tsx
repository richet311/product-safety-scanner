import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (profile) redirect('/dashboard')

  const meta = user.user_metadata as Record<string, string> | null
  return (
    <OnboardingClient
      userId={user.id}
      defaultFirstName={meta?.first_name ?? meta?.given_name ?? ''}
      defaultLastName={meta?.last_name ?? meta?.family_name ?? ''}
    />
  )
}
