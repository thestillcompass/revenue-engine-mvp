import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { apiServerError } from '@/lib/api-response'

const lengths = {name:80,business:80,headline:140,description:280,cta:45,question:160} as const
type Key = keyof typeof lengths
function validate(input:unknown):Record<Key,string>|null{
 if(!input || typeof input!=='object'||Array.isArray(input))return null
 const record=input as Record<string,unknown>
 const result={} as Record<Key,string>
 for(const key of Object.keys(lengths) as Key[]){
  if(typeof record[key]!=='string'||(record[key] as string).length>lengths[key])return null
  result[key]=record[key] as string
 }
 return result
}
export async function GET(){
 try{
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
  const ws=await getOrCreateWorkspace(supabase,user.id)
  const {data,error}=await supabase.from('funnel_drafts').select('draft,updated_at').eq('workspace_id',ws.id).maybeSingle()
  if(error)throw error
  return NextResponse.json({draft:data?.draft??null,updated_at:data?.updated_at??null})
 }catch(e){return apiServerError('Could not load funnel draft',e)}
}
export async function PUT(req:Request){
 try{
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
  const raw=await req.json().catch(()=>null)
  const draft=validate(raw)
  if(!draft)return NextResponse.json({error:'Invalid funnel draft'},{status:400})
  const ws=await getOrCreateWorkspace(supabase,user.id)
  const {data,error}=await supabase.from('funnel_drafts').upsert(
   {workspace_id:ws.id,user_id:user.id,draft,updated_at:new Date().toISOString()},
   {onConflict:'workspace_id'}
  ).select('updated_at').single()
  if(error)throw error
  return NextResponse.json({saved:true,updated_at:data.updated_at})
 }catch(e){return apiServerError('Could not save funnel draft',e)}
}
