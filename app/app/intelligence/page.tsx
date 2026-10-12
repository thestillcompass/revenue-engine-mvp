import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { IntelligenceForm } from '@/components/IntelligenceForm'
export default function Page(){return <div className="app-shell"><AppNav active="intelligence"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 4</div><h1>Revenue Intelligence</h1></div><LogoutButton/></header><IntelligenceForm/></main></div>}
