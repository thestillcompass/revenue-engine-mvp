import Link from 'next/link'

// V3 navigation copy maps to existing V0.1 routes until new owner screens are implemented.
// Do not display unimplemented My Leads or funnel publishing as active features.
export function AppNav({active}:{active:string}){
 const items=[
  ['overview','/app','Home'],
  ['studio','/app/funnel-studio','Funnel studio (preview)'],
  ['diagnostic','/app/diagnostic','Check my system'],
  ['qualification','/app/qualification','Who is a good lead?'],
  ['journey','/app/journey','Plan my journey'],
  ['intelligence','/app/intelligence','Understand my results']
 ]
 return <aside className="sidebar"><div className="brand"><span className="brandmark">R</span><span>Revenue Engine</span></div><nav aria-label="Workspace navigation">{items.map(([id,href,label])=><Link key={id} className={active===id?'active':''} aria-current={active===id?'page':undefined} href={href}>{label}</Link>)}</nav><p style={{marginTop:28,color:'#C3D1C7',fontSize:13}}>Your business, your growth.</p></aside>
}
