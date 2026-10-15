'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SessionGuard(){
  useEffect(()=>{
    const supabase=createClient()
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==='SIGNED_OUT'){
        const next=window.location.pathname+window.location.search
        window.location.replace('/login?reason=session_expired&next='+encodeURIComponent(next))
      }
    })
    return ()=>subscription.unsubscribe()
  },[])
  return null
}
