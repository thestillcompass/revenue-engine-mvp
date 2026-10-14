import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDiagnostic, type BusinessProfile } from '@/lib/engine/diagnostic'
import { validateDiagnosticInput } from '@/lib/engine/validation'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'

export async function POST(req:Request){
 try{
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})

  const body=await req.json()
  const profile=body.profile as BusinessProfile
  const answers=body.answers as Record<string,number>
  const validationError=validateDiagnosticInput(profile,answers)
  if(validationError)return NextResponse.json({error:validationError},{status:400})

  const workspace=await getOrCreateWorkspace(supabase,user.id,profile)
  const latest=(await supabase.from('diagnostics').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  if(latest && JSON.stringify(latest.answers)===JSON.stringify(answers) && JSON.stringify(workspace.profile)===JSON.stringify(profile)){
    return NextResponse.json({saved:latest,result:{scores:latest.scores,normalized:latest.normalized,priorities:latest.priorities,primaryLeak:latest.primary_leak,secondaryLeak:latest.secondary_leak,recommendation:latest.recommendation,delivery:latest.delivery},duplicate:true})
  }

  const result=analyzeDiagnostic(answers,profile)
  const {data,error}=await supabase.from('diagnostics').insert({workspace_id:workspace.id,user_id:user.id,answers,scores:result.scores,normalized:result.normalized,priorities:result.priorities,primary_leak:result.primaryLeak,secondary_leak:result.secondaryLeak,recommendation:result.recommendation,delivery:result.delivery}).select().single()
  if(error)throw error
  return NextResponse.json({saved:data,result})
 }catch(e:any){return NextResponse.json({error:e.message||'Diagnostic failed'},{status:500})}
}
