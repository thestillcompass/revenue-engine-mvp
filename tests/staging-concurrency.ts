import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

const STAGING_URL='https://wnjxbhcnizrelbasvxxv.supabase.co'
const FUNNEL_ID='b3853ca5-8c85-447d-8436-1d83a5baf5e1'
const WORKSPACE_ID='eb40abb2-755b-4153-8aa7-9ccd6f4a33cf'
const OWNER_ID='cb30aee8-3ed9-43e7-81de-114302f39a58'
const SLUG='87349ff4c1ff4c3194e5031eb78e8e56'
const key=process.env.QA_STAGING_SUPABASE_SECRET_KEY
if(process.env.QA_CONFIRM!=='RUN_STAGING_QA_ONLY'||process.env.QA_STAGING_SUPABASE_URL!==STAGING_URL||!key)throw new Error('QA guard failed: staging URL, secret, and explicit confirmation required')
const db=createClient(STAGING_URL,key,{auth:{persistSession:false,autoRefreshToken:false}})
const runId=randomUUID().replaceAll('-','')
const prefix='qa-concurrency-'+runId
let attempted=false
async function count(){
 const {count,error}=await db.from('funnel_leads').select('id',{count:'exact',head:true}).eq('funnel_id',FUNNEL_ID).like('visitor_email',prefix+'%')
 if(error)throw error
 return count??0
}
async function send(email:string){
 const {data,error}=await db.rpc('submit_funnel_enquiry',{
  p_slug:SLUG,p_name:'Concurrency QA',p_email:email,p_answer:'Synthetic staging-only concurrency test',p_consent:true,p_website:''
 })
 if(error)throw error
 return data===true
}
async function main(){
 const {data:f,error:fErr}=await db.from('funnels').select('id,slug,workspace_id,user_id,status').eq('id',FUNNEL_ID).single()
 if(fErr||!f||f.slug!==SLUG||f.workspace_id!==WORKSPACE_ID||f.user_id!==OWNER_ID||f.status!=='published')throw new Error('QA fixture identity/status mismatch')
 const {count:total,error:cErr}=await db.from('funnel_leads').select('id',{count:'exact',head:true}).eq('funnel_id',FUNNEL_ID)
 if(cErr||total!==0)throw new Error('QA funnel must have zero leads before starting; no test data changed')
 attempted=true
 const sharedEmail=prefix+'-duplicate@example.invalid'
 const duplicates=await Promise.all(Array.from({length:10},()=>send(sharedEmail)))
 const duplicateCount=await count()
 if(!duplicates.every(Boolean)||duplicateCount!==1)throw new Error('Duplicate concurrency failed: '+JSON.stringify({duplicateCount,accepted:duplicates.filter(Boolean).length}))
 console.log('PASS concurrent duplicates: ten requests, one stored lead')
 const unique=await Promise.all(Array.from({length:20},(_,i)=>send(prefix+'-unique'+i+'@example.invalid')))
 const stored=await count()
 const accepted=unique.filter(Boolean).length
 if(stored!==15||accepted!==14)throw new Error('Rate-limit concurrency failed: '+JSON.stringify({stored,accepted}))
 console.log('PASS concurrent rate cap: 20 competing unique requests, 14 inserted, 15 total')
} 
async function run(){
 try{await main()}finally{
  if(attempted){
   const {error}=await db.from('funnel_leads').delete().eq('funnel_id',FUNNEL_ID).like('visitor_email',prefix+'%')
   if(error)throw new Error('QA cleanup failed, inspect fixture safely: '+error.message)
   if(await count()!==0)throw new Error('QA cleanup incomplete')
   console.log('PASS cleanup: all run-specific leads removed')
  }
 }
}
run().catch(error=>{console.error(error);process.exitCode=1})
