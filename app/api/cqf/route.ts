import { NextResponse } from 'next/server'
import { apiServerError } from '@/lib/api-response'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { generateCqf } from '@/lib/engine/cqf'
import { validateCqfInput } from '@/lib/engine/validation'

export async function POST(req:Request){
 try{
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})

  const inputs=await req.json()
  const validationError=validateCqfInput(inputs)
  if(validationError)return NextResponse.json({error:validationError},{status:400})

  const ws=await getOrCreateWorkspace(supabase,user.id)
  const model=generateCqf(inputs)
  const latest=(await supabase.from('cqf_models').select('*').eq('workspace_id',ws.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  if(latest && JSON.stringify(latest.inputs)===JSON.stringify(inputs) && JSON.stringify(latest.model)===JSON.stringify(model)){
    return NextResponse.json({saved:latest,model:latest.model,duplicate:true})
  }
  const {data,error}=await supabase.from('cqf_models').insert({workspace_id:ws.id,user_id:user.id,inputs,model}).select().single()
  if(error)throw error
  return NextResponse.json({saved:data,model})
 }catch(e:unknown){return apiServerError('Qualification request failed',e)}
}
