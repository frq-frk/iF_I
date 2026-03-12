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
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          VideoPlatform
        </Link>
        <div className="flex space-x-4">
          {user ? (
            <>
              <Link href="/upload" className="text-gray-300 hover:text-white">
                Upload
              </Link>
              <button onClick={handleSignOut} className="text-gray-300 hover:text-white">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
              <Link href="/signup" className="text-gray-300 hover:text-white">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
