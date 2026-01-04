import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/PageTransition'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AmarVote - Secure Election Monitoring & Management System',
  description: 'Real-time incident tracking, vote management, and automated alerts for transparent elections',
  icons: {
    icon: '/images/logo-AmarVote.png',
    shortcut: '/images/logo-AmarVote.png',
    apple: '/images/logo-AmarVote.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
