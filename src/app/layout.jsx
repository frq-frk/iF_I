import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './Providers'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'iF_I',
  description: 'Upload, share, and discover amazing video content.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0f] text-slate-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
