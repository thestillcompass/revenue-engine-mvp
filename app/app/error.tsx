'use client'

import { useEffect } from 'react'

export default function Error({error,reset}:{error:Error & {digest?:string},reset:()=>void}){
  useEffect(()=>{console.error(error)},[error])
  return <div className="auth-wrap"><div className="card auth-card">
    <div className="brand"><span className="brandmark">R</span>Revenue Engine</div>
    <h2 style={{marginTop:28}}>We couldn't load this workspace.</h2>
    <p className="muted">Your saved data has not been changed. Try loading the page again. If the problem continues, sign out and return later.</p>
    <button className="btn primary" onClick={reset}>Try again</button>
  </div></div>
}
