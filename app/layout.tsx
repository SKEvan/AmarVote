import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/PageTransition'
import GlobalLoading from '@/components/GlobalLoading'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AmarVote - Secure Election Monitoring & Management System',
  description: 'Real-time incident tracking, vote management, and automated alerts for transparent elections',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/images/logo-AmarVote.svg', type: 'image/svg+xml' },
      { url: '/images/logo-AmarVote.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/images/logo-AmarVote.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/images/logo-AmarVote.svg', sizes: '512x512', type: 'image/svg+xml' }
    ],
    shortcut: '/images/logo-AmarVote.svg',
    apple: [
      { url: '/images/logo-AmarVote.svg', sizes: '180x180', type: 'image/svg+xml' }
    ]
  },
  openGraph: {
    title: 'AmarVote - Secure Election Monitoring & Management System',
    description: 'Real-time incident tracking, vote management, and automated alerts for transparent elections',
    images: ['/images/logo-AmarVote.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AmarVote - Secure Election Monitoring & Management System',
    description: 'Real-time incident tracking, vote management, and automated alerts for transparent elections',
    images: ['/images/logo-AmarVote.svg'],
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
        <GlobalLoading />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
