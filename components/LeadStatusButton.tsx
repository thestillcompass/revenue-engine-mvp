'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export function LeadStatusButton({id,currentStatus}:{id:string;currentStatus:string}){
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const router=useRouter()
 async function update(next:string){
  setBusy(true);setError('')
  try{const res=await fetch('/api/leads/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});if(!res.ok)throw Error('Could not update lead');router.refresh()}catch{setError('Could not update lead. Try again.')}finally{setBusy(false)}
 }
 return <div><label className="field">Update status <select className="select" style={{maxWidth:220}} disabled={busy} value={currentStatus} onChange={e=>update(e.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label>{error&&<p className="error" role="alert">{error}</p>}</div>
}
