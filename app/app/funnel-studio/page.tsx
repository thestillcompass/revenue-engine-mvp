import { AppNav } from '@/components/AppNav'
import { ConsultationFunnelStudio } from '@/components/ConsultationFunnelStudio'
import { LogoutButton } from '@/components/LogoutButton'
export default function FunnelStudioPage(){return <div className="app-shell"><AppNav active="studio"/><main className="app-main"><header className="app-head"><div><div className="eyebrow">Revenue Engine V3 · Private prototype</div><h1>Consultation funnel studio</h1></div><LogoutButton/></header><p className="lead">Build a clear first impression and qualification question, without technical setup.</p><ConsultationFunnelStudio/></main></div>}
