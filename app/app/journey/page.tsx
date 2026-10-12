import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { JourneyBuilder } from '@/components/JourneyBuilder'
export default function Page(){return <div className="app-shell"><AppNav active="journey"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 3</div><h1>Journey Generation Engine</h1></div><LogoutButton/></header><JourneyBuilder/></main></div>}
