'use client'

export function ErrorNotice({message,onRetry}:{message:string,onRetry?:()=>void}){
  return <div className="card" role="alert" style={{border:'1px solid rgba(180,60,60,.35)'}}>
    <div className="eyebrow">Something needs attention</div>
    <h3 style={{marginTop:8}}>We couldn't complete that action.</h3>
    <p className="muted">{message}</p>
    {onRetry&&<button className="btn secondary" type="button" onClick={onRetry}>Try again</button>}
  </div>
}

export function friendlyRequestError(error:unknown){
  if(error instanceof TypeError) return 'We could not reach the server. Check your connection and try again.'
  return 'Something went wrong while processing your request. Please try again.'
}

export async function readApiResponse(r:Response){
  let data:any={}
  try{ data=await r.json() }catch{}
  if(r.status===401){
    const next=window.location.pathname+window.location.search
    window.location.replace('/login?reason=session_expired&next='+encodeURIComponent(next))
    throw new Error('SESSION_EXPIRED')
  }
  if(!r.ok) throw new Error(data?.error || 'We could not complete that action. Please try again.')
  return data
}
