import { notFound } from 'next/navigation'
import { PublicEnquiryForm } from '@/components/PublicEnquiryForm'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export default async function PublicFunnel({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 if(!/^[a-f0-9]{32}$/.test(slug))notFound()
 if(!process.env.SUPABASE_SECRET_KEY)throw new Error('Staging server credentials missing')
 const supabase=createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false}})
 const {data,error}=await supabase.rpc('get_published_funnel',{requested_slug:slug})
 if(error||!data?.length)notFound()
 const c=data[0].content as Record<string,string>
 return <main className="container" style={{maxWidth:780,padding:'48px 16px'}}><div className="brand"><span className="brandmark">R</span>{c.business}</div><section className="card" style={{marginTop:48}}><div className="eyebrow">Get in touch</div><h1 style={{fontSize:'clamp(32px,5vw,56px)',lineHeight:1.1}}>{c.headline}</h1><p className="lead">{c.description}</p><PublicEnquiryForm slug={slug} question={c.question}/></section></main>
}
