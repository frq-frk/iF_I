'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import {
  selectUploadActive,
  selectUploadProgress,
  selectUploadStage,
  selectUploadFileName,
  resetUpload,
} from '../store/slices/uploadSlice';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const uploadActive = useAppSelector(selectUploadActive);
  const uploadProgress = useAppSelector(selectUploadProgress);
  const uploadStage = useAppSelector(selectUploadStage);
  const uploadFileName = useAppSelector(selectUploadFileName);
  const router = useRouter();

  // Auto-dismiss complete/failed indicator after 3 seconds
  useEffect(() => {
    if (uploadStage === 'complete' || uploadStage === 'failed') {
      const timer = setTimeout(() => dispatch(resetUpload()), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadStage, dispatch]);

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
          <Link
            href="/contests"
            className="rounded-lg px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Contests
          </Link>
          <Link
            href="/learn"
            className="rounded-lg px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Learn
          </Link>
          {user ? (
            <>
              {/* Upload progress indicator */}
              {(uploadActive || uploadStage === 'complete' || uploadStage === 'failed') && (
                <Link
                  href="/upload"
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    uploadStage === 'complete'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : uploadStage === 'failed'
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
                  }`}
                >
                  {uploadActive && (
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {uploadStage === 'complete' && (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {uploadStage === 'failed' && (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="max-w-[8rem] truncate">{uploadFileName}</span>
                  {uploadActive && <span>{uploadProgress}%</span>}
                  {uploadStage === 'complete' && <span>Done</span>}
                  {uploadStage === 'failed' && <span>Failed</span>}
                </Link>
              )}
              <Link
                href="/upload"
                className="rounded-lg px-4 py-2 text-[0.8125rem] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Upload
              </Link>
              <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 gap-0.5">
                <Link
                  href={`/user/${user.uid}`}
                  className="group relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                  title="Profile"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md bg-white/[0.1] px-2 py-1 text-[0.6875rem] text-slate-300 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    Profile
                  </span>
                </Link>
                <Link
                  href="/settings"
                  className="group relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                  title="Settings"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md bg-white/[0.1] px-2 py-1 text-[0.6875rem] text-slate-300 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    Settings
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="group relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-red-400"
                  title="Sign Out"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md bg-white/[0.1] px-2 py-1 text-[0.6875rem] text-slate-300 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    Sign Out
                  </span>
                </button>
              </div>
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
