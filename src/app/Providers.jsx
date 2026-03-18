'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import StoreProvider from '../store/StoreProvider'
import { useAppDispatch } from '../store/hooks'
import { setUser, clearUser } from '../store/slices/authSlice'
import Navbar from '../components/Navbar'
import UploadManager from '../components/UploadManager'
import { Toaster } from 'sonner'

function AuthSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let displayName = null;
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) displayName = snap.data().displayName || null;
        } catch {}
        dispatch(setUser({ uid: user.uid, email: user.email, displayName }));
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return null;
}

export default function Providers({ children }) {
  return (
    <StoreProvider>
      <AuthSync />
      <UploadManager>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: 'rgba(15,15,25,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            color: '#e2e8f0',
            fontSize: '0.8125rem',
          },
        }}
      />
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </UploadManager>
    </StoreProvider>
  )
}
