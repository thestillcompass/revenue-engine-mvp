import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { calculateMetrics } from '@/lib/engine/metrics'
import { validateMetricInputs } from '@/lib/engine/validation'

export async function POST(req:Request){
 try{
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})

  const inputs=await req.json()
  const validationError=validateMetricInputs(inputs)
  if(validationError)return NextResponse.json({error:validationError},{status:400})

  const ws=await getOrCreateWorkspace(supabase,user.id)
  const latest=(await supabase.from('metric_snapshots').select('*').eq('workspace_id',ws.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  if(latest && JSON.stringify(latest.inputs)===JSON.stringify(inputs))return NextResponse.json({saved:latest,metrics:latest.metrics,duplicate:true})

  const metrics=calculateMetrics(inputs)
  const {data,error}=await supabase.from('metric_snapshots').insert({workspace_id:ws.id,user_id:user.id,inputs,metrics}).select().single()
  if(error)throw error
  return NextResponse.json({saved:data,metrics})
 }catch(e:any){return NextResponse.json({error:e.message||'Metrics failed'},{status:500})}
}
