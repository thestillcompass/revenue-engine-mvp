import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { DiagnosticForm } from '@/components/DiagnosticForm'
import { createClient } from '@/lib/supabase/server'

export default async function Page(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  const workspace=(await supabase.from('workspaces').select('*').eq('user_id',user!.id).maybeSingle()).data
  let history:any[]=[]
  if(workspace){
    history=(await supabase.from('diagnostics').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(10)).data||[]
  }
  const latest=history[0]||null
  const initialResult=latest?{normalized:latest.normalized,scores:latest.scores,priorities:latest.priorities,primaryLeak:latest.primary_leak,secondaryLeak:latest.secondary_leak,recommendation:latest.recommendation,delivery:latest.delivery}:null
  const initialHistory=history.map((d:any)=>({
    id:d.id,
    normalized:d.normalized,
    primaryLeak:d.primary_leak,
    recommendation:d.recommendation,
    delivery:d.delivery,
    createdAt:d.created_at
  }))
  return <div className="app-shell"><AppNav active="diagnostic"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 1</div><h1>Lead-to-Revenue Diagnostic</h1></div><LogoutButton/></header><DiagnosticForm initialProfile={workspace?.profile} initialAnswers={latest?.answers} initialResult={initialResult} initialHistory={initialHistory}/></main></div>
}
