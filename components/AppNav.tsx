import Link from 'next/link'

export function AppNav({active}:{active:string}){
 const items=[['overview','/app','Overview'],['diagnostic','/app/diagnostic','Diagnostic'],['qualification','/app/qualification','Qualification'],['journey','/app/journey','Journey'],['intelligence','/app/intelligence','Intelligence']]
 return <aside className="sidebar"><div className="brand"><span className="brandmark">R</span><span>Revenue Engine</span></div><nav>{items.map(([id,href,label])=><Link key={id} className={active===id?'active':''} href={href}>{label}</Link>)}</nav><p style={{marginTop:28,color:'#92aa9f',fontSize:13}}>Hosted MVP · Supabase-backed workspace</p></aside>
}
