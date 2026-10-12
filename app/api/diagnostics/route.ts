import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDiagnostic, type BusinessProfile } from '@/lib/engine/diagnostic'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'

export async function POST(req:Request){
 try{
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await req.json(); const profile=body.profile as BusinessProfile; const answers=body.answers as Record<string,number>
  if(!profile || !answers || Object.keys(answers).length<30)return NextResponse.json({error:'Complete all 30 questions.'},{status:400})
  const result=analyzeDiagnostic(answers,profile); const workspace=await getOrCreateWorkspace(supabase,user.id,profile)
  const {data,error}=await supabase.from('diagnostics').insert({workspace_id:workspace.id,user_id:user.id,answers,scores:result.scores,normalized:result.normalized,priorities:result.priorities,primary_leak:result.primaryLeak,secondary_leak:result.secondaryLeak,recommendation:result.recommendation,delivery:result.delivery}).select().single()
  if(error)throw error
  return NextResponse.json({saved:data,result})
 }catch(e:any){return NextResponse.json({error:e.message||'Diagnostic failed'},{status:500})}
}
