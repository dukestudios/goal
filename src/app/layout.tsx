import localFont from 'next/font/local'
import { Allura } from 'next/font/google'
import './globals.css'

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist'
})

const allura = Allura({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-allura'
})

export const metadata = {
  title: 'Christmas Gospel Share',
  description: 'Share the Gospel this Christmas season',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${allura.variable} font-geist`}>
        {children}
      </body>
    </html>
  )
}
