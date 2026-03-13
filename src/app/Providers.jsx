'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import StoreProvider from '../store/StoreProvider'
import { useAppDispatch } from '../store/hooks'
import { setUser, clearUser } from '../store/slices/authSlice'
import Navbar from '../components/Navbar'

function AuthSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email }));
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
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </StoreProvider>
  )
}
