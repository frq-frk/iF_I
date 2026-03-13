'use client'

import Link from 'next/link';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const user = useAppSelector(selectUser);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-[1.1rem] font-semibold tracking-tight text-white">
          iF_I
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/upload"
                className="rounded-lg px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Upload
              </Link>
              <Link
                href={`/user/${user.uid}`}
                className="rounded-lg px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-white/[0.06] px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-[0.8125rem] font-medium text-white transition-all hover:bg-indigo-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
