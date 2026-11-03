'use client'
import { useEffect, useState } from 'react'

type Funnel = {name:string;business:string;headline:string;description:string;cta:string;question:string}
const initial:Funnel={name:'Consultation funnel',business:'Your Business',headline:'Let’s find the right next step for your business.',description:'Tell us a little about your goals and we’ll help you explore your options.',cta:'Start my enquiry',question:'What would you like help with?'}
export function ConsultationFunnelStudio(){
 const [draft,setDraft]=useState<Funnel>(initial)
 const [view,setView]=useState<'desktop'|'mobile'>('desktop')
 const [loading,setLoading]=useState(true)
 const [saving,setSaving]=useState(false)
 const [notice,setNotice]=useState('')
 const [publication,setPublication]=useState<{slug:string;status:string}|null>(null)
 const [publishing,setPublishing]=useState(false)
 const [dirty,setDirty]=useState(false)
 const [starterSector,setStarterSector]=useState<'consulting'|'agency'|'services'>('consulting')
 const [starterGoal,setStarterGoal]=useState<'consultation'|'enquiry'>('consultation')
 const [starterBusiness,setStarterBusiness]=useState('')
 useEffect(()=>{
  let active=true
  fetch('/api/funnel-draft',{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error('Draft loading is unavailable');return r.json()}).then(data=>{if(active&&data.draft)setDraft(data.draft)}).catch(()=>{if(active)setNotice('Draft storage is not configured yet. Changes here are temporary.')}).finally(()=>{if(active)setLoading(false)})
  fetch('/api/funnel-publication',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{if(active&&v?.funnel)setPublication(v.funnel)}).catch(()=>{})
  return ()=>{active=false}
 },[])
 async function saveDraft(){setSaving(true);setNotice('');try{const r=await fetch('/api/funnel-draft',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(draft)});if(!r.ok)throw Error('Could not save draft');setDirty(false);setNotice('Draft saved to your workspace.')}catch{setNotice('Save failed. Your edits remain on this page only.')}finally{setSaving(false)}}
 async function publishDraft(){
  if(publishing||loading||saving||dirty)return
  setPublishing(true);setNotice('')
  try{
   const r=await fetch('/api/funnel-publication',{method:'POST'})
   const data=await r.json()
   if(!r.ok)throw new Error(data.error||'Publication failed')
   setPublication({slug:data.slug,status:'published'})
   setNotice('Saved draft published as version '+data.version+'. Open the public page to check your changes.')
  }catch(e){setNotice(e instanceof Error?e.message:'Publication failed')}
  finally{setPublishing(false)}
 }
 async function unpublishFunnel(){
  if(publishing||loading)return
  setPublishing(true);setNotice('')
  try{
   const r=await fetch('/api/funnel-publication',{method:'DELETE'})
   const data=await r.json()
   if(!r.ok)throw new Error(data.error||'Unpublishing failed')
   setPublication(current=>current?{...current,status:'draft'}:null)
   setNotice('Funnel unpublished. Its public page is now unavailable.')
  }catch(e){setNotice(e instanceof Error?e.message:'Unpublishing failed')}
  finally{setPublishing(false)}
 }
 const change=(key:keyof Funnel,value:string)=>{setDirty(true);setDraft(p=>({...p,[key]:value}))}
 function applyStarter(){
  if(loading||saving||publishing)return
  // Intentionally explicit: starter templates never save or publish automatically.
  const business=(starterBusiness.trim()||draft.business||'Your Business').slice(0,80)
  const descriptions={
   consulting:'Tell us about the challenges your organisation is facing so we can explore whether our consulting services are a fit.',
   agency:'Share what you want to improve in your marketing or operations so we can discuss a suitable approach.',
   services:'Tell us what you need and we can discuss whether our services are the right fit.'
  }
  const questions={
   consulting:'What is the main business challenge you want to address?',
   agency:'What result are you looking to achieve?',
   services:'What kind of support are you looking for?'
  }
  const headline=starterGoal==='consultation'?'Explore the right next step for your business.':'Tell us what you need help with.'
  setDraft(p=>({...p,business,headline,description:descriptions[starterSector],question:questions[starterSector],cta:starterGoal==='consultation'?'Request a Consultation':'Send an Enquiry'}))
  setDirty(true)
  setNotice('Starter copy added to the editor only. Review and edit it before saving; your published funnel has not changed.')
 }
 const fields: {key:keyof Funnel;label:string;max:number;multiline?:boolean}[]=[
  {key:'name',label:'Internal funnel name',max:80},
  {key:'business',label:'Business name',max:80},
  {key:'headline',label:'Headline visitors see',max:140,multiline:true},
  {key:'description',label:'Short description',max:280,multiline:true},
  {key:'cta',label:'Button text',max:45},
  {key:'question',label:'First qualification question',max:160,multiline:true}
 ]
 return <div className="v3-studio">
  <section className="card v3-editor"><div className="eyebrow">Step 1 · Create</div><h2>Make it yours</h2><p className="muted">Edit the text, then try your funnel preview. Edits remain private until you save and publish a new version.</p>
   <div className="stack" style={{marginBottom:24}}>
    <h3>Start with a guided example</h3>
    <p className="muted">Choose your business type and desired outcome. This creates editable starting copy, not AI-generated content. Applying it replaces the six-field editor copy locally, but does not save or publish.</p>
    <div className="field"><label htmlFor="v2-starter-business">Business name</label><input id="v2-starter-business" className="input" maxLength={80} placeholder={draft.business} value={starterBusiness} onChange={e=>setStarterBusiness(e.target.value)}/></div>
    <div className="field"><label htmlFor="v2-starter-sector">Business type</label><select id="v2-starter-sector" className="input" value={starterSector} onChange={e=>setStarterSector(e.target.value as typeof starterSector)}><option value="consulting">Consulting</option><option value="agency">Marketing or creative agency</option><option value="services">Other professional services</option></select></div>
    <div className="field"><label htmlFor="v2-starter-goal">Funnel objective</label><select id="v2-starter-goal" className="input" value={starterGoal} onChange={e=>setStarterGoal(e.target.value as typeof starterGoal)}><option value="consultation">Consultation request</option><option value="enquiry">General enquiry</option></select></div>
    <button className="btn secondary" type="button" disabled={loading||saving||publishing} onClick={applyStarter}>Apply starting copy to editor</button>
   </div>
   <div className="stack">{fields.map(f=><div className="field" key={f.key}><label htmlFor={'f-'+f.key}>{f.label}</label>{f.multiline?<textarea id={'f-'+f.key} className="textarea" maxLength={f.max} value={draft[f.key]} onChange={e=>change(f.key,e.target.value)}/>:<input id={'f-'+f.key} className="input" maxLength={f.max} value={draft[f.key]} onChange={e=>change(f.key,e.target.value)}/>}</div>)}</div>
   <div className="hero-actions"><button className="btn primary" type="button" disabled={saving||loading} onClick={saveDraft}>{saving?'Saving…':'Save draft'}</button><button className="btn secondary" type="button" onClick={()=>{setDraft(initial);setDirty(true);setNotice('Example restored locally. Click Save draft to keep it.') }}>Reset example</button></div><div className="hero-actions"><button className="btn secondary" type="button" disabled={publishing||loading||saving||dirty} onClick={publishDraft}>{publishing?'Working…':publication?.status==='published'?'Publish changes':'Publish saved draft'}</button>{publication?.status==='published'&&<><a className="btn secondary" href={'/f/'+publication.slug} target="_blank" rel="noopener noreferrer">View published page</a><button className="btn secondary" type="button" disabled={publishing||loading} onClick={unpublishFunnel}>Unpublish funnel</button></>}</div><p aria-live="polite" className="muted">{dirty?'Unsaved changes. Save before publishing. ':''}{loading?'Loading saved draft…':notice||'Changes are not saved automatically.'}</p>
  </section>
  <section className="card v3-preview-wrap"><div className="v3-preview-head"><div><div className="eyebrow">Step 2 · Preview</div><h2>See what visitors see</h2></div><div className="v3-preview-toggle" aria-label="Preview width"><button className={'btn '+(view==='desktop'?'primary':'secondary')} type="button" onClick={()=>setView('desktop')} aria-pressed={view==='desktop'}>Desktop</button><button className={'btn '+(view==='mobile'?'primary':'secondary')} type="button" onClick={()=>setView('mobile')} aria-pressed={view==='mobile'}>Mobile</button></div></div>
  <div className={'v3-preview '+(view==='mobile'?'v3-preview-mobile':'')}>
   <div className="v3-preview-brand">{draft.business||'Your business'}</div>
   <div className="v3-preview-content">
    <span className="v3-tag">Get in touch</span>
    <h2>{draft.headline||'Your headline goes here'}</h2>
    <p>{draft.description||'Add a short description of your offer.'}</p>
    <div className="stack" style={{marginTop:28}}>
     <h3>{draft.question||'What would you like help with?'}</h3>
     <div className="field"><label htmlFor="v2-preview-name">Your name</label><input id="v2-preview-name" className="input" placeholder="Your name" disabled/></div>
     <div className="field"><label htmlFor="v2-preview-email">Your email</label><input id="v2-preview-email" className="input" type="email" placeholder="you@example.com" disabled/></div>
     <div className="field"><label htmlFor="v2-preview-answer">Your answer</label><textarea id="v2-preview-answer" className="textarea" placeholder="Visitor response" disabled/></div>
     <label style={{display:'flex',alignItems:'start',gap:9}}><input type="checkbox" disabled/><span>I agree that this business may use my information to respond to this enquiry. This is not consent to marketing messages.</span></label>
     <p className="muted">A security check appears on the published page.</p>
     <button type="button" className="btn primary" disabled>{draft.cta||'Send enquiry'}</button>
    </div>
   </div>
  </div>
  <div className="v3-preview-note">Read-only preview of the public enquiry layout. No leads are submitted here. Publish the saved draft to update your public funnel.</div></section>
 </div>
}
