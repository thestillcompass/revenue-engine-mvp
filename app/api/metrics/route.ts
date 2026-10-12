import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { calculateMetrics } from '@/lib/engine/metrics'
export async function POST(req:Request){try{const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const inputs=await req.json();const metrics=calculateMetrics(inputs);const ws=await getOrCreateWorkspace(supabase,user.id);const {data,error}=await supabase.from('metric_snapshots').insert({workspace_id:ws.id,user_id:user.id,inputs,metrics}).select().single();if(error)throw error;return NextResponse.json({saved:data,metrics})}catch(e:any){return NextResponse.json({error:e.message||'Metrics failed'},{status:500})}}
