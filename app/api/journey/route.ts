import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { generateJourney } from '@/lib/engine/journey'
import { validateJourneyConfig } from '@/lib/engine/validation'

export async function POST(req:Request){
 try{
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})

  const config=await req.json()
  const validationError=validateJourneyConfig(config)
  if(validationError)return NextResponse.json({error:validationError},{status:400})

  const ws=await getOrCreateWorkspace(supabase,user.id)
  const latestDiagnostic=(await supabase.from('diagnostics').select('*').eq('workspace_id',ws.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  if(!latestDiagnostic)return NextResponse.json({error:'Run the diagnostic first.'},{status:400})

  const blocks=generateJourney({modules:latestDiagnostic.recommendation?.modules||[],entry:config.entry,goal:config.goal,crm:ws.crm||'Zoho CRM',booking:ws.booking_tool||'Calendly',nurture:config.nurture})
  const latest=(await supabase.from('journeys').select('*').eq('workspace_id',ws.id).order('created_at',{ascending:false}).limit(1).maybeSingle()).data
  if(latest && JSON.stringify(latest.config)===JSON.stringify(config) && JSON.stringify(latest.blocks)===JSON.stringify(blocks)){
    return NextResponse.json({saved:latest,blocks:latest.blocks,duplicate:true})
  }

  const {data,error}=await supabase.from('journeys').insert({workspace_id:ws.id,user_id:user.id,config,blocks}).select().single()
  if(error)throw error
  return NextResponse.json({saved:data,blocks})
 }catch(e:any){return NextResponse.json({error:e.message||'Journey failed'},{status:500})}
}
