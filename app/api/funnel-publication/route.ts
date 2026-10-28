import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'

const fields={name:80,business:80,headline:140,description:280,cta:45,question:160} as const
type Draft=Record<keyof typeof fields,string>
function valid(x:unknown):x is Draft {
 if(!x||typeof x!=='object'||Array.isArray(x))return false
 const o=x as Record<string,unknown>
 return (Object.keys(fields) as (keyof Draft)[]).every(k=>typeof o[k]==='string' && (o[k] as string).length<=fields[k] && (k==='description'||Boolean((o[k] as string).trim())))
}
async function context(){
 const db=await createClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return null
 const ws=await getOrCreateWorkspace(db,user.id)
 return {db,user,ws}
}
export async function GET(){
 try{
  const ctx=await context()
  if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data,error}=await ctx.db.from('funnels').select('id,slug,status,published_version_id').eq('workspace_id',ctx.ws.id).maybeSingle()
  if(error)throw error
  return NextResponse.json({funnel:data??null},{headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'Could not load publication status'},{status:500})}
}
export async function POST(){
 try{
  const ctx=await context()
  if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data:saved,error:draftError}=await ctx.db.from('funnel_drafts').select('draft').eq('workspace_id',ctx.ws.id).maybeSingle()
  if(draftError)throw draftError
  if(!valid(saved?.draft))return NextResponse.json({error:'Save a valid draft before publishing'},{status:400})
  let {data:funnel,error}=await ctx.db.from('funnels').select('id,slug').eq('workspace_id',ctx.ws.id).maybeSingle()
  if(error)throw error
  if(!funnel){
   const created=await ctx.db.from('funnels').insert({workspace_id:ctx.ws.id,user_id:ctx.user.id}).select('id,slug').single()
   if(created.error)throw created.error
   funnel=created.data
  }
  const versions=await ctx.db.from('funnel_versions').select('version_number').eq('funnel_id',funnel.id).order('version_number',{ascending:false}).limit(1)
  if(versions.error)throw versions.error
  const next=(versions.data?.[0]?.version_number??0)+1
  const v=await ctx.db.from('funnel_versions').insert({funnel_id:funnel.id,workspace_id:ctx.ws.id,user_id:ctx.user.id,version_number:next,content:saved.draft}).select('id').single()
  if(v.error)throw v.error
  const changed=await ctx.db.from('funnels').update({status:'published',published_version_id:v.data.id,updated_at:new Date().toISOString()}).eq('id',funnel.id).select('slug').single()
  if(changed.error)throw changed.error
  return NextResponse.json({published:true,slug:changed.data.slug,version:next})
 }catch{return NextResponse.json({error:'Publishing failed; please retry'},{status:500})}
}
export async function DELETE(){
 try{
  const ctx=await context()
  if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401})
  const r=await ctx.db.from('funnels').update({status:'draft',updated_at:new Date().toISOString()}).eq('workspace_id',ctx.ws.id)
  if(r.error)throw r.error
  return NextResponse.json({published:false})
 }catch{return NextResponse.json({error:'Could not unpublish funnel'},{status:500})}
}
