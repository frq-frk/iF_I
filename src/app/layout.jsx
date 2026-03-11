import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './Providers'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
