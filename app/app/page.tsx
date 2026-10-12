import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import Link from 'next/link'

export default async function Dashboard(){
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  const {data:workspace}=await supabase.from('workspaces').select('*').eq('user_id',user!.id).maybeSingle()
  let diagnostic:any=null, metrics:any=null
  if(workspace){
    diagnostic=(await supabase.from('diagnostics').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
    metrics=(await supabase.from('metric_snapshots').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  }
  const rec=diagnostic?.recommendation
  return <div className="app-shell"><AppNav active="overview"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Revenue Engine Workspace</div><h1>{workspace?.name || 'Start your workspace'}</h1></div><LogoutButton/></header>
    {!diagnostic ? <div className="card"><span className="pill">Step 1</span><h2 style={{marginTop:14}}>Diagnose your lead-to-revenue system.</h2><p className="lead">The engine needs a baseline before it can recommend qualification, journey and optimization modules.</p><Link className="btn primary" href="/app/diagnostic">Run diagnostic</Link></div> : <>
      <div className="summary-grid"><div className="metric"><span>Revenue Engine Score</span><strong>{diagnostic.normalized}/100</strong></div><div className="metric"><span>Primary diagnosis</span><strong style={{fontSize:18}}>{rec?.diagnosis}</strong></div><div className="metric"><span>Recommended deployment</span><strong style={{fontSize:18}}>{diagnostic.delivery}</strong></div></div>
      <section className="section"><div className="card"><span className="pill">Recommended engine</span><h2 style={{marginTop:12}}>{rec?.engine}</h2><p className="lead">{rec?.explanation}</p><div className="hero-actions"><Link className="btn primary" href="/app/qualification">Build qualification</Link><Link className="btn secondary" href="/app/journey">Generate journey</Link></div></div></section>
      <section className="section"><div className="grid three"><div className="card"><h3>Current modules</h3><p className="muted">{(rec?.modules||[]).join(' · ') || 'None yet'}</p></div><div className="card"><h3>Latest revenue signal</h3><p className="muted">{metrics?.metrics?.signal || 'Add performance data to activate intelligence.'}</p></div><div className="card"><h3>Next commercial step</h3><p className="muted">Move from diagnosis to a deployable engine, then activate recurring optimization when sufficient live data exists.</p></div></div></section>
    </>}
  </main></div>
}
