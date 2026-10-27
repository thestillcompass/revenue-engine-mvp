'use client'
import { useMemo, useState } from 'react'
import { maturityLabels, pillars, questions } from '@/lib/engine/questions'
import { ErrorNotice, friendlyRequestError, readApiResponse } from '@/components/ErrorNotice'

const defaultProfile={businessName:'',offer:'',idealCustomer:'',avgValue:100000,monthlyLeads:25,leadSource:'Instagram / Meta',crm:'Zoho CRM',bookingTool:'Calendly',offersCount:0,salesUsers:0,capability:1,bookingComplexity:0}

export function DiagnosticForm({initialProfile,initialAnswers,initialResult,initialHistory=[]}:{initialProfile?:any,initialAnswers?:Record<string,number>,initialResult?:any,initialHistory?:any[]}){
 const [answers,setAnswers]=useState<Record<string,number>>(initialAnswers||{});const [profile,setProfile]=useState<any>(initialProfile||defaultProfile);const [busy,setBusy]=useState(false);const [result,setResult]=useState<any>(initialResult||null);const [history,setHistory]=useState<any[]>(initialHistory);const [error,setError]=useState('');const answered=Object.keys(answers).length
 const groups=useMemo(()=>pillars.map(p=>({...p,qs:questions.filter(q=>q.pillar===p.code)})),[])
 function setP(k:string,v:any){setProfile((x:any)=>({...x,[k]:v}))}
 async function submit(){
  if(answered<30)return setError('Please score all 30 questions before analyzing your system.')
  setBusy(true);setError('')
  try{
    const r=await fetch('/api/diagnostics',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile,answers})})
    const data=await readApiResponse(r)
    setResult(data)
    if(data.saved&&!data.duplicate){
      const h={id:data.saved.id,normalized:data.saved.normalized,primaryLeak:data.saved.primary_leak,recommendation:data.saved.recommendation,delivery:data.saved.delivery,createdAt:data.saved.created_at}
      setHistory(x=>[h,...x].slice(0,10))
    }
  }catch(e:any){
    if(e?.message!=='SESSION_EXPIRED')setError(e?.message||friendlyRequestError(e))
  }finally{setBusy(false)}
 }
 return <div className="stack">{error&&<ErrorNotice message={error} onRetry={answered===30?submit:undefined}/>} <div className="card"><div className="eyebrow">Business profile</div><h2>Commercial context</h2><div className="form-grid">
   <F label="Business / workspace name"><input className="input" value={profile.businessName} onChange={e=>setP('businessName',e.target.value)} /></F>
   <F label="Primary offer"><input className="input" value={profile.offer} onChange={e=>setP('offer',e.target.value)} /></F>
   <F label="Ideal customer"><input className="input" value={profile.idealCustomer} onChange={e=>setP('idealCustomer',e.target.value)} /></F>
   <F label="Average customer value (₹)"><input className="input" type="number" value={profile.avgValue} onChange={e=>setP('avgValue',Number(e.target.value))} /></F>
   <F label="Monthly inbound enquiries"><input className="input" type="number" value={profile.monthlyLeads} onChange={e=>setP('monthlyLeads',Number(e.target.value))} /></F>
   <F label="Primary lead source"><select className="select" value={profile.leadSource} onChange={e=>setP('leadSource',e.target.value)}><option>Instagram / Meta</option><option>Website</option><option>LinkedIn</option><option>WhatsApp</option><option>Referrals</option><option>Other</option></select></F>
   <F label="CRM"><select className="select" value={profile.crm} onChange={e=>setP('crm',e.target.value)}><option>Zoho CRM</option><option>HubSpot</option><option>Google Sheets</option><option>No CRM</option><option>Other / Custom</option></select></F>
   <F label="Booking"><select className="select" value={profile.bookingTool} onChange={e=>setP('bookingTool',e.target.value)}><option>Calendly</option><option>Zoho Bookings</option><option>Manual / No booking tool</option><option>Other</option></select></F>
   <F label="Number of offers"><select className="select" value={profile.offersCount} onChange={e=>setP('offersCount',Number(e.target.value))}><option value={0}>1</option><option value={1}>2</option><option value={2}>3+</option></select></F>
   <F label="Sales users"><select className="select" value={profile.salesUsers} onChange={e=>setP('salesUsers',Number(e.target.value))}><option value={0}>1</option><option value={1}>2–3</option><option value={2}>4+</option></select></F>
   <F label="Implementation comfort"><select className="select" value={profile.capability} onChange={e=>setP('capability',Number(e.target.value))}><option value={2}>High</option><option value={1}>Moderate</option><option value={0}>Low</option></select></F>
   <F label="Booking complexity"><select className="select" value={profile.bookingComplexity} onChange={e=>setP('bookingComplexity',Number(e.target.value))}><option value={0}>One calendar</option><option value={1}>Multiple calendars</option><option value={2}>Complex routing</option></select></F>
 </div></div>
 {groups.map(g=><div className="card pillar" key={g.code}><span className="pill">{g.code} · {g.name}</span><h3 style={{marginTop:12}}>{g.description}</h3>{g.qs.map(q=><div className="qrow" key={q.key}><div><b>{q.label}</b><div className="muted" style={{fontSize:12,marginTop:4}}>{answers[q.key]!==undefined?maturityLabels[answers[q.key]]:'Choose 0–4'}</div></div><div className="scale">{[0,1,2,3,4].map(v=><button className={answers[q.key]===v?'selected':''} onClick={()=>setAnswers(a=>({...a,[q.key]:v}))} type="button" key={v}>{v}</button>)}</div></div>)}</div>)}
 <div className="card"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><b>{answered}/30 answered</b><div className="muted">0 = missing · 4 = optimized</div></div><button className="btn primary" disabled={busy} onClick={submit}>{busy?'Analyzing…':'Analyze & Save'}</button></div></div>
 {result&&<Result result={result}/>}<History items={history}/></div>
}
function F({label,children}:{label:string,children:React.ReactNode}){return <div className="field"><label>{label}</label>{children}</div>}
const pillarNames:Record<string,string>={A:'Acquisition',C:'Capture',Q:'Qualification',V:'Conversion',N:'Nurture',M:'Measurement'}
function scoreBand(score:number){
 if(score<=6)return 'Critical gap'
 if(score<=11)return 'Needs attention'
 if(score<=15)return 'Functional / developing'
 if(score<=18)return 'Strong'
 return 'Optimized'
}
function Result({result}:{result:any}){
 const r=result.result||result
 return <div className="card">
  <div className="result-hero"><div className="big-score"><div><strong>{r.normalized}</strong><div>/100</div></div></div><div><span className="pill">{r.recommendation.readiness}</span><h2 style={{marginTop:12}}>{r.recommendation.engine}</h2><p className="lead">{r.recommendation.explanation}</p><p><b>Delivery:</b> {r.delivery}</p></div></div>
  {(r.primaryLeak||r.secondaryLeak)&&<div className="grid two" style={{marginTop:20}}>
    <div className="metric"><span>Primary constraint</span><strong style={{fontSize:18}}>{pillarNames[r.primaryLeak]||r.primaryLeak}</strong><div className="muted">Highest weighted improvement priority</div></div>
    <div className="metric"><span>Secondary constraint</span><strong style={{fontSize:18}}>{pillarNames[r.secondaryLeak]||r.secondaryLeak}</strong><div className="muted">Next most important weakness</div></div>
  </div>}
  <div className="grid three" style={{marginTop:20}}>{Object.entries(r.scores).map(([k,v]:any)=><div className="metric" key={k}><span>{k} · {pillarNames[k]}</span><strong>{v}/20</strong><div className="muted">{scoreBand(v)}</div><div className="bar"><span style={{width:`${v/20*100}%`}}/></div></div>)}</div>
  <div className="card" style={{marginTop:20,padding:16}}>
    <b>How to read the scores</b>
    <p className="muted" style={{marginBottom:0}}>0–6 Critical gap · 7–11 Needs attention · 12–15 Functional / developing · 16–18 Strong · 19–20 Optimized. Qualification and Conversion receive extra priority weight because weaknesses there are closer to revenue.</p>
  </div>
 </div>
}

function History({items}:{items:any[]}){
 if(!items.length)return null
 return <div className="card"><div className="eyebrow">Diagnostic history</div><h2>Progress over time</h2><p className="muted">Each changed diagnostic is preserved as a separate run. Identical repeat submissions are not duplicated.</p><div className="stack">{items.map((item:any,index:number)=>{const previous=items[index+1];const delta=previous?item.normalized-previous.normalized:null;return <div className="mini-row" key={item.id}><div><b>{index===0?'Latest run':'Previous run'}</b><div className="muted">{new Date(item.createdAt).toLocaleString()}</div></div><div style={{textAlign:'right'}}><b>{item.normalized}/100</b>{delta!==null&&<div className="muted">{delta>0?'+':''}{delta} vs prior</div>}</div></div>})}</div></div>
}
