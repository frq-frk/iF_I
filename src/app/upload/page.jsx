'use client'

import { useAppSelector } from '../../store/hooks';
import { selectUser, selectAuthLoading } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useActionState } from 'react';
import { uploadVideo } from '../actions';

const initialState = {
  message: null,
};

const UploadPage = () => {
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const router = useRouter();
  const [state, formAction] = useActionState(uploadVideo, initialState);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (state.message === 'Video uploaded successfully!') {
      router.push('/');
    }
  }, [state.message, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="h-6 w-40 mx-auto rounded-lg animate-pulse-soft bg-white/[0.06]" />
          <div className="h-3 w-56 mx-auto rounded-lg animate-pulse-soft bg-white/[0.04]" />
          <div className="mt-8 space-y-5">
            <div className="h-12 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            <div className="h-28 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            <div className="h-12 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            <div className="h-12 rounded-xl animate-pulse-soft bg-indigo-600/20" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Upload Video</h1>
          <p className="mt-2 text-sm text-slate-500">Share your content with the community</p>
        </div>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="title" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Give your video a title"
              className="mt-2 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what your video is about..."
              className="mt-2 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
              rows="4"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="video" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Video File
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-6 text-center transition-colors hover:border-white/[0.2] hover:bg-white/[0.03]">
              <svg className="mx-auto h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                className="mt-3 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer file:transition-colors"
                required
              />
              <p className="mt-2 text-xs text-slate-600">MP4, WebM, or OGG up to 500MB</p>
            </div>
          </div>

          {state.message && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{state.message}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
          >
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
