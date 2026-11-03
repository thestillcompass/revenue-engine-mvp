import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
const URL='https://wnjxbhcnizrelbasvxxv.supabase.co'
const fixtures=[
 {id:'b3853ca5-8c85-447d-8436-1d83a5baf5e1',workspace:'eb40abb2-755b-4153-8aa7-9ccd6f4a33cf',owner:'cb30aee8-3ed9-43e7-81de-114302f39a58',slug:'87349ff4c1ff4c3194e5031eb78e8e56'},
 {id:'5be169c9-ea2f-463c-aaab-e683f7c1365d',workspace:'7138f258-f1f6-4185-ac74-462573970d01',owner:'a9cc3939-695d-4026-9328-5a2fb59e062a',slug:'8a43f51b6b6e4f7fab9885e3b74ebf31'}
] as {id:string;workspace:string;owner:string;slug:string}[]
const key=process.env.QA_STAGING_SUPABASE_SECRET_KEY
if(process.env.QA_CONFIRM!=='RUN_STAGING_QA_ONLY'||process.env.QA_STAGING_SUPABASE_URL!==URL||!key)throw new Error('Staging-only guard failed')
if(fixtures[0].workspace===fixtures[1].workspace||fixtures[0].owner===fixtures[1].owner)throw new Error('Fixtures must have separate owners and workspaces')
const db=createClient(URL,key,{auth:{persistSession:false,autoRefreshToken:false}})
const prefix='qa-cross-'+randomUUID().replaceAll('-','')
let started=false
async function run(){
 try{
  for(const f of fixtures){
   const {data,error}=await db.from('funnels').select('id,slug,workspace_id,user_id,status').eq('id',f.id).single()
   if(error||!data||data.slug!==f.slug||data.workspace_id!==f.workspace||data.user_id!==f.owner||data.status!=='published')throw new Error('Fixture mismatch: '+f.slug)
   const {count,error:countError}=await db.from('funnel_leads').select('id',{head:true,count:'exact'}).eq('funnel_id',f.id)
   if(countError||count!==0)throw new Error('Fixture must have zero leads: '+f.slug)
  }
  started=true
  // Eight concurrent requests per fixture. Use the same start barrier for both.
  const tasks=fixtures.flatMap((f,index)=>Array.from({length:8},(_,i)=>({f,index,i})))
  const responses=await Promise.all(tasks.map(async ({f,index,i})=>{
   const {data,error}=await db.rpc('submit_funnel_enquiry',{
    p_slug:f.slug,p_name:'Cross-workspace QA',p_email:prefix+'-'+index+'-'+i+'@example.invalid',p_answer:'Synthetic staging QA only',p_consent:true,p_website:''
   })
   if(error)throw new Error('RPC failed for workspace '+index+': '+error.message)
   return {index,accepted:data===true}
  }))
  for(const [index,f] of fixtures.entries()){
   const {count,error}=await db.from('funnel_leads').select('id',{head:true,count:'exact'}).eq('funnel_id',f.id).like('visitor_email',prefix+'%')
   if(error||count!==8||responses.filter(x=>x.index===index&&x.accepted).length!==8)throw new Error('Cross-workspace submission mismatch in workspace '+index+', count='+count)
   console.log('PASS workspace '+(index+1)+': 8 concurrent enquiries stored independently')
  }
  console.log('PASS cross-workspace correctness: two independent owners, 16 total test leads')
 }finally{
  if(started){
   for(const f of fixtures){
    const {error}=await db.from('funnel_leads').delete().eq('funnel_id',f.id).like('visitor_email',prefix+'%')
    if(error)throw new Error('Cleanup failed for '+f.slug+': '+error.message)
    const {count,error:checkError}=await db.from('funnel_leads').select('id',{head:true,count:'exact'}).eq('funnel_id',f.id).like('visitor_email',prefix+'%')
    if(checkError||count!==0)throw new Error('Cleanup incomplete for '+f.slug)
   }
   console.log('PASS cleanup: zero run-specific leads remain in either QA funnel')
  }
 }
}
run().catch(err=>{console.error(err);process.exitCode=1})
