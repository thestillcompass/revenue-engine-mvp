import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionGuard } from '@/components/SessionGuard'

export default async function AppLayout({children}:{children:React.ReactNode}){
  const supabase=await createClient()
  const {data}=await supabase.auth.getClaims()
  if(!data?.claims) redirect('/login?reason=session_expired&next=/app')
  return <><SessionGuard/>{children}</>
}
