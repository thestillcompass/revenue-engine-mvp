import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Revenue Engine',
  description: 'Diagnose, build and optimize your lead-to-revenue system.'
}

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>
}
