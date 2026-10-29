import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
async function context(){
 const db=await createClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return null
 await getOrCreateWorkspace(db,user.id)
 return {db,user}
}
export async function GET(){
 try{
  const ctx=await context()
  if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data,error}=await ctx.db.from('funnels').select('id,slug,status,published_version_id').eq('user_id',ctx.user.id).maybeSingle()
  if(error)throw error
  return NextResponse.json({funnel:data??null},{headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'Could not load publication status'},{status:500})}
}
export async function POST(){
 try{
  const ctx=await context()
  if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data,error}=await ctx.db.rpc('publish_saved_funnel')
  if(error)throw error
  return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'Could not publish saved draft'},{status:500})}
}
export async function DELETE(){
 try{
  const ctx=await context()
  if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {data,error}=await ctx.db.rpc('unpublish_saved_funnel')
  if(error||data!==true)throw error??new Error('Not unpublished')
  return NextResponse.json({published:false},{headers:{'Cache-Control':'no-store'}})
 }catch{return NextResponse.json({error:'Could not unpublish funnel'},{status:500})}
}
