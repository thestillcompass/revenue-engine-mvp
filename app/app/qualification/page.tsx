import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { CqfBuilder } from '@/components/CqfBuilder'
export default function Page(){return <div className="app-shell"><AppNav active="qualification"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 2</div><h1>CQF Qualification Engine</h1></div><LogoutButton/></header><CqfBuilder/></main></div>}
