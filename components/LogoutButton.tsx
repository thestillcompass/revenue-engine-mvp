'use client'
import { createClient } from '@/lib/supabase/client'
export function LogoutButton(){return <button className="btn ghost" onClick={async()=>{await createClient().auth.signOut();location.href='/'}}>Log out</button>}
