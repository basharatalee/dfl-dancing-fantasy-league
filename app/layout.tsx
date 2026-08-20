import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'Fantasy Dancing League',
  description: 'Build your dream team from the world\'s best dancers and compete in the ultimate fantasy sports experience.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/images/fdl-logo.png',
        sizes: 'any',
      },
    ],
    apple: '/images/fdl-logo.png',
  },
  openGraph: {
    title: 'Fantasy Dancing League',
    description: 'Build your dream team from the world\'s best dancers and compete in the ultimate fantasy sports experience.',
    url: 'https://fantasydancingleague.com',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body suppressHydrationWarning className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
