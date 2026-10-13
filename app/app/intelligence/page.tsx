import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { IntelligenceForm } from '@/components/IntelligenceForm'
import { createClient } from '@/lib/supabase/server'

export default async function Page(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  const workspace=(await supabase.from('workspaces').select('id').eq('user_id',user!.id).maybeSingle()).data
  let latest:any=null
  if(workspace){
    latest=(await supabase.from('metric_snapshots').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  }
  return <div className="app-shell"><AppNav active="intelligence"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 4</div><h1>Revenue Intelligence</h1></div><LogoutButton/></header><IntelligenceForm initialInputs={latest?.inputs} initialMetrics={latest?.metrics}/></main></div>
}
