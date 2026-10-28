import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:'Invalid lead'},{status:400})
 const db=await createClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
 const payload=await req.json().catch(()=>null)
 if(!payload||!['new','contacted','closed'].includes(payload.status))return NextResponse.json({error:'Invalid status'},{status:400})
 const {data,error}=await db.from('funnel_leads').update({status:payload.status}).eq('id',id).eq('user_id',user.id).select('id').maybeSingle()
 if(error)return NextResponse.json({error:'Unable to update lead'},{status:500})
 if(!data)return NextResponse.json({error:'Not found'},{status:404})
 return NextResponse.json({saved:true})
}
