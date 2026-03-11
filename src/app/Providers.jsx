'use client'

import Navbar from '../components/Navbar'
import { AuthProvider } from './AuthContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="container mx-auto p-4">{children}</main>
    </AuthProvider>
  )
}
