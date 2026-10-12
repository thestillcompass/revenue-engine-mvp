'use client'
import Link from 'next/link'
import { useState } from 'react'

const qs=[
 ['A','Do you have a reliable source of new enquiries?'],['A','Can you identify which channel generated each enquiry?'],
 ['C','Are new enquiries captured and acknowledged quickly?'],['C','Are contact details stored in one structured system?'],
 ['Q','Do you use consistent criteria to decide which leads are worth pursuing?'],['Q','Can you distinguish active buyers from people just researching?'],
 ['V','Can a qualified lead book the next step immediately?'],['V','Do you have structured reminders and no-show recovery?'],
 ['N','Do good-fit leads who are not ready enter a structured nurture path?'],['N','Can dormant leads be requalified later?'],
 ['M','Can you track qualified → booked → attended → won?'],['M','Can you connect revenue back to the original source?']
] as const
const names:any={A:'Acquisition',C:'Capture',Q:'Qualification',V:'Conversion',N:'Nurture',M:'Measurement'}
export function FreeDiagnostic(){const [a,setA]=useState<Record<number,number>>({});const [done,setDone]=useState(false);const scores:any={A:0,C:0,Q:0,V:0,N:0,M:0};Object.entries(a).forEach(([i,v])=>scores[qs[Number(i)][0]]+=v);const overall=Math.round(Object.values(scores).reduce((x:any,y:any)=>x+y,0)/48*100);const low=Object.entries(scores).sort((x:any,y:any)=>x[1]-y[1])[0];return <div className="stack">{!done? <><div className="card"><span className="pill">Free 3-minute diagnostic</span><h2 style={{marginTop:12}}>Where is your lead journey leaking?</h2><p className="muted">Score each statement from 0 (missing) to 4 (optimized).</p></div>{qs.map((q,i)=><div className="card qrow" key={i}><div><b>{q[1]}</b><div className="muted">{names[q[0]]}</div></div><div className="scale">{[0,1,2,3,4].map(v=><button type="button" className={a[i]===v?'selected':''} key={v} onClick={()=>setA(x=>({...x,[i]:v}))}>{v}</button>)}</div></div>)}<button className="btn primary" disabled={Object.keys(a).length<qs.length} onClick={()=>setDone(true)}>Show my result</button></> : <div className="card"><div className="result-hero"><div className="big-score"><div><strong>{overall}</strong><div>/100</div></div></div><div><span className="pill">Free diagnosis</span><h2 style={{marginTop:12}}>Primary leak: {names[low[0]]}</h2><p className="lead">Your quick assessment suggests {names[low[0]].toLowerCase()} is currently the weakest part of the lead-to-revenue journey. The full workspace uses 30 questions, commercial context and routing rules to recommend the exact modules to deploy.</p><div className="hero-actions"><Link className="btn primary" href="/signup">Unlock full diagnosis</Link><Link className="btn secondary" href="/login">Log in</Link></div></div></div></div>}</div>}
