import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LetsMeet — 같이 떠날 날짜를 찾아요',
  description: '가능한 날짜를 모아 모두에게 맞는 여행 일정을 찾아드려요.',
  openGraph: {
    title: 'LetsMeet — 같이 떠날 날짜를 찾아요',
    description: '가능한 날짜를 모아 모두에게 맞는 여행 일정을 찾아드려요.',
    images: ['/hero.jpg'],
    url: 'https://letsmeet-nu.vercel.app',
    siteName: 'LetsMeet',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LetsMeet — 같이 떠날 날짜를 찾아요',
    description: '가능한 날짜를 모아 모두에게 맞는 여행 일정을 찾아드려요.',
    images: ['/hero.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}