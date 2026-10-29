'use client'
import { useState, useRef, type FormEvent } from 'react'
import Script from 'next/script'
export function PublicEnquiryForm({slug,question}:{slug:string;question:string}){
 const formRef=useRef<HTMLFormElement>(null)
 const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
 const [name,setName]=useState('')
 const [email,setEmail]=useState('')
 const [answer,setAnswer]=useState('')
 const [consent,setConsent]=useState(false)
 const [website,setWebsite]=useState('')
 const [status,setStatus]=useState<'idle'|'busy'|'done'>('idle')
 const [error,setError]=useState('')
 async function submit(e:FormEvent){
  e.preventDefault();setStatus('busy');setError('')
  try{const r=await fetch('/api/public-enquiry/'+slug,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,answer,consent,website,turnstileToken:(formRef.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value??'')})});if(!r.ok)throw new Error((await r.json()).error||'Submission failed');setStatus('done')}catch(e){setError(e instanceof Error?e.message:'Please try again');setStatus('idle')}
 }
 if(status==='done')return <div role="status" className="card"><h3>Thank you. Your enquiry was received.</h3><p>The business can review your details and follow up.</p></div>
 return <form ref={formRef} onSubmit={submit} className="stack" style={{marginTop:28}}>
 <h3>{question}</h3>
 <div className="field"><label htmlFor="visitor-name">Your name</label><input id="visitor-name" className="input" required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></div>
 <div className="field"><label htmlFor="visitor-email">Your email</label><input id="visitor-email" type="email" className="input" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></div>
 <div className="field"><label htmlFor="visitor-answer">Your answer</label><textarea id="visitor-answer" className="textarea" required minLength={1} maxLength={1500} value={answer} onChange={e=>setAnswer(e.target.value)}/></div>
 <div className="field" aria-hidden="true" style={{position:'absolute',left:'-9999px'}}><label htmlFor="website-field">Website</label><input id="website-field" tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></div>
 <label style={{display:'flex',alignItems:'start',gap:9}}><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/> <span>I agree that this business may use my information to respond to this enquiry. This is not consent to marketing messages.</span></label>
 {error&&<p role="alert" className="error">{error}</p>}
 {sitekey&&<><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/><div className="cf-turnstile" data-sitekey={sitekey}/></>}
 <button className="btn primary" type="submit" disabled={status==='busy'}>{status==='busy'?'Submitting…':'Send enquiry'}</button>
 </form>
}
