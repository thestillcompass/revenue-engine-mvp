'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false)
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMsg('');const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error)return setMsg(error.message);location.href='/app'}
  return <div className="auth-wrap"><form onSubmit={submit} className="card auth-card"><div className="brand"><span className="brandmark">R</span>Revenue Engine</div><h2 style={{marginTop:28}}>Welcome back</h2><p className="muted">Open your revenue workspace.</p><div className="stack"><div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input className="input" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{msg&&<p className="error">{msg}</p>}<button className="btn primary" disabled={busy}>{busy?'Signing in…':'Log in'}</button><p className="muted">No account? <Link href="/signup"><b>Create one</b></Link></p></div></form></div>
}
