'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Signup(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false)
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMsg('');const supabase=createClient();const redirectTo=`${location.origin}/auth/callback`;const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});setBusy(false);if(error)return setMsg(error.message);setMsg('Check your email to confirm your account, then log in.')}
  return <div className="auth-wrap"><form onSubmit={submit} className="card auth-card"><div className="brand"><span className="brandmark">R</span>Revenue Engine</div><h2 style={{marginTop:28}}>Create your workspace</h2><p className="muted">Save diagnostics, build your qualification model and track revenue performance.</p><div className="stack"><div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input className="input" minLength={8} type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{msg&&<p className={msg.startsWith('Check')?'success':'error'}>{msg}</p>}<button className="btn primary" disabled={busy}>{busy?'Creating…':'Create free account'}</button><p className="muted">Already have an account? <Link href="/login"><b>Log in</b></Link></p></div></form></div>
}
