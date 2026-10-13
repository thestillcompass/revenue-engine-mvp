import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { JourneyBuilder } from '@/components/JourneyBuilder'
import { createClient } from '@/lib/supabase/server'

export default async function Page(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  const workspace=(await supabase.from('workspaces').select('id').eq('user_id',user!.id).maybeSingle()).data
  let latest:any=null
  if(workspace){
    latest=(await supabase.from('journeys').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  }
  return <div className="app-shell"><AppNav active="journey"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 3</div><h1>Journey Generation Engine</h1></div><LogoutButton/></header><JourneyBuilder initialConfig={latest?.config} initialBlocks={latest?.blocks}/></main></div>
}
