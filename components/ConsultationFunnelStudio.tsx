'use client'
import { useState } from 'react'

type Funnel = {name:string;business:string;headline:string;description:string;cta:string;question:string}
const initial:Funnel={name:'Consultation funnel',business:'Your Business',headline:'Let’s find the right next step for your business.',description:'Tell us a little about your goals and we’ll help you explore your options.',cta:'Start my enquiry',question:'What would you like help with?'}
export function ConsultationFunnelStudio(){
 const [draft,setDraft]=useState<Funnel>(initial)
 const [view,setView]=useState<'desktop'|'mobile'>('desktop')
 const [showQuestions,setShowQuestions]=useState(false)
 const change=(key:keyof Funnel,value:string)=>setDraft(p=>({...p,[key]:value}))
 const fields: {key:keyof Funnel;label:string;max:number;multiline?:boolean}[]=[
  {key:'name',label:'Internal funnel name',max:80},
  {key:'business',label:'Business name',max:80},
  {key:'headline',label:'Headline visitors see',max:140,multiline:true},
  {key:'description',label:'Short description',max:280,multiline:true},
  {key:'cta',label:'Button text',max:45},
  {key:'question',label:'First qualification question',max:160,multiline:true}
 ]
 return <div className="v3-studio">
  <section className="card v3-editor"><div className="eyebrow">Step 1 · Create</div><h2>Make it yours</h2><p className="muted">Edit the text, then try your funnel preview. Nothing is published or sent to customers.</p>
   <div className="stack">{fields.map(f=><div className="field" key={f.key}><label htmlFor={'f-'+f.key}>{f.label}</label>{f.multiline?<textarea id={'f-'+f.key} className="textarea" maxLength={f.max} value={draft[f.key]} onChange={e=>change(f.key,e.target.value)}/>:<input id={'f-'+f.key} className="input" maxLength={f.max} value={draft[f.key]} onChange={e=>change(f.key,e.target.value)}/>}</div>)}</div>
   <button className="btn secondary" type="button" onClick={()=>{setDraft(initial);setShowQuestions(false)}}>Reset example</button>
  </section>
  <section className="card v3-preview-wrap"><div className="v3-preview-head"><div><div className="eyebrow">Step 2 · Preview</div><h2>See what visitors see</h2></div><div className="v3-preview-toggle" aria-label="Preview width"><button className={'btn '+(view==='desktop'?'primary':'secondary')} type="button" onClick={()=>setView('desktop')} aria-pressed={view==='desktop'}>Desktop</button><button className={'btn '+(view==='mobile'?'primary':'secondary')} type="button" onClick={()=>setView('mobile')} aria-pressed={view==='mobile'}>Mobile</button></div></div>
  <div className={'v3-preview '+(view==='mobile'?'v3-preview-mobile':'')}><div className="v3-preview-brand">{draft.business||'Your business'}</div>{!showQuestions?<div className="v3-preview-content"><span className="v3-tag">Let's get started</span><h2>{draft.headline||'Your headline goes here'}</h2><p>{draft.description||'Add a short description of your offer.'}</p><button type="button" className="btn primary" onClick={()=>setShowQuestions(true)}>{draft.cta||'Get started'} →</button></div>:<div className="v3-preview-content"><span className="v3-tag">A quick question</span><h2>{draft.question||'Tell us about your needs'}</h2><label htmlFor="v3-demo-answer">Your answer</label><textarea id="v3-demo-answer" className="textarea" placeholder="This is a preview only; no answer is stored."/><p className="muted">Preview only — this form does not submit or save information.</p><button type="button" className="btn secondary" onClick={()=>setShowQuestions(false)}>← Back to introduction</button></div>}</div>
  <div className="v3-preview-note">Draft prototype · No publishing · No lead capture · No AI generation yet</div></section>
 </div>
}
