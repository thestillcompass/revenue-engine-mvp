import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
export async function POST(req:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 if(!/^[a-f0-9]{32}$/.test(slug))return NextResponse.json({error:'Invalid form'},{status:400})
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return NextResponse.json({error:'Expected JSON'},{status:415})
 const body=await req.text()
 if(Buffer.byteLength(body,'utf8')>4096)return NextResponse.json({error:'Request too large'},{status:413})
 let value:unknown
 try{value=JSON.parse(body)}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 if(!value||typeof value!=='object'||Array.isArray(value))return NextResponse.json({error:'Invalid request'},{status:400})
 const v=value as Record<string,unknown>
 if(typeof v.name!=='string'||typeof v.email!=='string'||typeof v.answer!=='string'||v.consent!==true||typeof v.website!=='string'||v.name.length>120||v.email.length>254||v.answer.length>1500||v.website.length>100)return NextResponse.json({error:'Check all fields and consent'},{status:400})
 const secret=process.env.TURNSTILE_SECRET_KEY
 const serverKey=process.env.SUPABASE_SECRET_KEY
 // Until staging credentials are provisioned, preserve the existing limited pilot behaviour.
 // DO NOT revoke the anonymous RPC grant before both private keys and the widget are tested.
 if(Boolean(secret)!==Boolean(serverKey))return NextResponse.json({error:'Submission security is not fully configured'},{status:503})
 if(secret && serverKey){
  if(typeof v.turnstileToken!=='string'||v.turnstileToken.length<1||v.turnstileToken.length>2048)return NextResponse.json({error:'Complete the security check'},{status:400})
  let accepted=false
  try{
   const reply=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({secret,response:v.turnstileToken}),signal:AbortSignal.timeout(5000),cache:'no-store'
   })
   const verified=await reply.json() as {success?:boolean,hostname?:string}
   const expectedHost=process.env.TURNSTILE_EXPECTED_HOSTNAME
   accepted=reply.ok && verified.success===true && Boolean(expectedHost) && verified.hostname===expectedHost
  }catch{accepted=false}
  if(!accepted)return NextResponse.json({error:'Security check failed. Please retry.'},{status:403})
 }
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,serverKey||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await db.rpc('submit_funnel_enquiry',{p_slug:slug,p_name:v.name,p_email:v.email,p_answer:v.answer,p_consent:v.consent,p_website:v.website})
 if(error)return NextResponse.json({error:'Unable to submit enquiry'},{status:503})
 if(data!==true)return NextResponse.json({error:'Unable to accept enquiry. Check your details or try later.'},{status:400})
 return NextResponse.json({submitted:true},{headers:{'Cache-Control':'no-store'}})
}
