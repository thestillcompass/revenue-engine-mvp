import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { LeadStatusButton } from '@/components/LeadStatusButton'

export default async function LeadsPage(){
 const db=await createClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return null
 const ws=await getOrCreateWorkspace(db,user.id)
 const {data:leads,error}=await db.from('funnel_leads').select('id,visitor_name,visitor_email,answer,status,created_at').eq('workspace_id',ws.id).order('created_at',{ascending:false}).limit(100)
 return <div className="app-shell"><AppNav active="leads"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Revenue Engine V3</div><h1>My Leads</h1></div><LogoutButton/></header><p className="lead">Enquiries from your published funnels will appear here. New submissions are not enabled yet.</p>{error?<div className="card error">Unable to load your leads. Please try again.</div>:!leads?.length?<div className="card"><h2>No enquiries yet</h2><p className="muted">When lead capture is enabled and someone completes your funnel, their enquiry will appear here.</p></div>:<div className="stack">{leads.map(l=><section key={l.id} className="card"><div className="app-head"><div><h3>{l.visitor_name}</h3><p className="muted">{l.visitor_email} · {new Date(l.created_at).toLocaleDateString()}</p></div><span className="pill">{l.status}</span></div><p style={{whiteSpace:'pre-wrap'}}>{l.answer}</p><LeadStatusButton id={l.id} currentStatus={l.status}/></section>)}</div>}</main></div>
}
