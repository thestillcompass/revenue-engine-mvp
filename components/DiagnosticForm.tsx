'use client'
import { useMemo, useState } from 'react'
import { maturityLabels, pillars, questions } from '@/lib/engine/questions'

const defaultProfile={businessName:'',offer:'',idealCustomer:'',avgValue:100000,monthlyLeads:25,leadSource:'Instagram / Meta',crm:'Zoho CRM',bookingTool:'Calendly',offersCount:0,salesUsers:0,capability:1,bookingComplexity:0}

export function DiagnosticForm({initialProfile,initialAnswers,initialResult}:{initialProfile?:any,initialAnswers?:Record<string,number>,initialResult?:any}){
 const [answers,setAnswers]=useState<Record<string,number>>(initialAnswers||{});const [profile,setProfile]=useState<any>(initialProfile||defaultProfile);const [busy,setBusy]=useState(false);const [result,setResult]=useState<any>(initialResult||null);const answered=Object.keys(answers).length
 const groups=useMemo(()=>pillars.map(p=>({...p,qs:questions.filter(q=>q.pillar===p.code)})),[])
 function setP(k:string,v:any){setProfile((x:any)=>({...x,[k]:v}))}
 async function submit(){if(answered<30)return alert('Please score all 30 questions.');setBusy(true);const r=await fetch('/api/diagnostics',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile,answers})});const data=await r.json();setBusy(false);if(!r.ok)return alert(data.error||'Could not save diagnostic');setResult(data);}
 return <div className="stack"><div className="card"><div className="eyebrow">Business profile</div><h2>Commercial context</h2><div className="form-grid">
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
 {result&&<Result result={result}/>}</div>
}
function F({label,children}:{label:string,children:React.ReactNode}){return <div className="field"><label>{label}</label>{children}</div>}
function Result({result}:{result:any}){const r=result.result||result;return <div className="card"><div className="result-hero"><div className="big-score"><div><strong>{r.normalized}</strong><div>/100</div></div></div><div><span className="pill">{r.recommendation.readiness}</span><h2 style={{marginTop:12}}>{r.recommendation.engine}</h2><p className="lead">{r.recommendation.explanation}</p><p><b>Delivery:</b> {r.delivery}</p></div></div><div className="grid three" style={{marginTop:20}}>{Object.entries(r.scores).map(([k,v]:any)=><div className="metric" key={k}><span>{k}</span><strong>{v}/20</strong><div className="bar"><span style={{width:`${v/20*100}%`}}/></div></div>)}</div></div>}
