'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'

type TurnstileAPI = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
type TurnstileWindow = Window & { turnstile?: TurnstileAPI }

export function PublicEnquiryForm({slug,question}:{slug:string;question:string}){
 const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
 const widgetContainer=useRef<HTMLDivElement>(null)
 const widgetId=useRef<string|null>(null)
 const tokenRef=useRef('')
 const [name,setName]=useState('')
 const [email,setEmail]=useState('')
 const [answer,setAnswer]=useState('')
 const [consent,setConsent]=useState(false)
 const [website,setWebsite]=useState('')
 const [status,setStatus]=useState<'idle'|'busy'|'done'>('idle')
 const [verification,setVerification]=useState<'loading'|'ready'|'failed'>(sitekey?'loading':'failed')
 const [error,setError]=useState('')
 const [scriptRetry,setScriptRetry]=useState(0)

 function initializeTurnstile(){
  const api=(window as TurnstileWindow).turnstile
  if(!sitekey||!api||!widgetContainer.current||widgetId.current)return
  try {
   widgetId.current=api.render(widgetContainer.current,{
    sitekey,
    callback:(token:string)=>{tokenRef.current=token;setVerification('ready');setError('')},
    'error-callback':()=>{tokenRef.current='';setVerification('failed');return true},
    'expired-callback':()=>{tokenRef.current='';setVerification('failed')},
    'timeout-callback':()=>{tokenRef.current='';setVerification('failed')}
   })
  }catch{setVerification('failed')}
 }

 function retryVerification(){
  tokenRef.current=''
  setError('')
  setVerification('loading')
  const api=(window as TurnstileWindow).turnstile
  if(api&&widgetId.current){
   try{api.reset(widgetId.current);return}catch{}
  }
  // If the script failed to load, request a new script instance.
  setScriptRetry(x=>x+1)
 }

 useEffect(()=>{
  return ()=>{
   const api=(window as TurnstileWindow).turnstile
   if(api&&widgetId.current){try{api.remove(widgetId.current)}catch{}}
   widgetId.current=null
  }
 },[])

 async function submit(e:FormEvent){
  e.preventDefault()
  if(sitekey && (verification!=='ready'||!tokenRef.current)){
   setError('Security verification is not ready. Please retry the check.')
   return
  }
  setStatus('busy');setError('')
  try{
   const r=await fetch('/api/public-enquiry/'+slug,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,email,answer,consent,website,turnstileToken:tokenRef.current})
   })
   if(!r.ok){
    const body=await r.json().catch(()=>({error:'Submission failed'}))
    throw new Error(body.error||'Submission failed')
   }
   setStatus('done')
  }catch(e){
   setError(e instanceof Error?e.message:'Please try again')
   setStatus('idle')
   if(sitekey)retryVerification()
   if(sitekey)setError(e instanceof Error?e.message:'Please try again')
  }
 }
 if(status==='done')return <div role="status" className="card"><h3>Thank you. Your enquiry was received.</h3><p>The business can review your details and follow up.</p></div>
 return <form onSubmit={submit} className="stack" style={{marginTop:28}}>
  <h3>{question}</h3>
  <div className="field"><label htmlFor="visitor-name">Your name</label><input id="visitor-name" className="input" required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></div>
  <div className="field"><label htmlFor="visitor-email">Your email</label><input id="visitor-email" type="email" className="input" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></div>
  <div className="field"><label htmlFor="visitor-answer">Your answer</label><textarea id="visitor-answer" className="textarea" required minLength={1} maxLength={1500} value={answer} onChange={e=>setAnswer(e.target.value)}/></div>
  <div className="field" aria-hidden="true" style={{position:'absolute',left:'-9999px'}}><label htmlFor="website-field">Website</label><input id="website-field" tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></div>
  <label style={{display:'flex',alignItems:'start',gap:9}}><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/> <span>I agree that this business may use my information to respond to this enquiry. This is not consent to marketing messages.</span></label>
  {sitekey&&<>
   <Script key={scriptRetry} src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={initializeTurnstile} onError={()=>setVerification('failed')}/>
   <div ref={widgetContainer}/>
   {verification==='loading'&&<p role="status">Checking your connection securely…</p>}
   {verification==='failed'&&<div role="alert"><p>Security verification could not complete. Check your connection or browser extensions, then retry. Your answers are saved on this page.</p><button className="btn" type="button" onClick={retryVerification}>Retry security check</button></div>}
  </>}
  {error&&<p role="alert" className="error">{error}</p>}
  <button className="btn primary" type="submit" disabled={status==='busy'||Boolean(sitekey&&verification!=='ready')}>{status==='busy'?'Submitting…':'Send enquiry'}</button>
 </form>
}
