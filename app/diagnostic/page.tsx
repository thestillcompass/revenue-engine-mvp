import Link from 'next/link'
import { FreeDiagnostic } from '@/components/FreeDiagnostic'
export default function Page(){return <div className="container"><header className="topnav"><Link href="/" className="brand"><span className="brandmark">R</span>Revenue Engine</Link><Link className="btn secondary" href="/login">Log in</Link></header><main className="section"><div style={{maxWidth:850,margin:'0 auto'}}><FreeDiagnostic/></div></main></div>}
