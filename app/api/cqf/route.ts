import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateWorkspace } from '@/lib/supabase/workspace'
import { generateCqf } from '@/lib/engine/cqf'
export async function POST(req:Request){try{const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const inputs=await req.json();const model=generateCqf(inputs);const ws=await getOrCreateWorkspace(supabase,user.id);const {data,error}=await supabase.from('cqf_models').insert({workspace_id:ws.id,user_id:user.id,inputs,model}).select().single();if(error)throw error;return NextResponse.json({saved:data,model})}catch(e:any){return NextResponse.json({error:e.message||'CQF failed'},{status:500})}}
