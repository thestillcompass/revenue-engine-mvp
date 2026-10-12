import { AppNav } from '@/components/AppNav'
import { LogoutButton } from '@/components/LogoutButton'
import { DiagnosticForm } from '@/components/DiagnosticForm'
export default function Page(){return <div className="app-shell"><AppNav active="diagnostic"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Step 1</div><h1>Lead-to-Revenue Diagnostic</h1></div><LogoutButton/></header><DiagnosticForm/></main></div>}
