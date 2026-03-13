'use client'

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { use, useEffect, useState } from 'react';
import VideoCard from '../../../components/VideoCard';
import Link from 'next/link';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import { deleteVideo, toggleVideoVisibility } from '../../actions';

function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="aspect-video animate-pulse-soft bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="h-3 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-3 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
      <div className="border-t border-white/[0.04] px-4 py-3">
        <div className="h-3 w-20 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
    </div>
  );
}

const UserProfilePage = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const currentUser = useAppSelector(selectUser);
  const isOwner = currentUser?.uid === params.userId;

  useEffect(() => {
    let cancelled = false;
    const fetchUserVideos = async () => {
      try {
        const videosCollection = collection(db, 'videos');
        const q = query(videosCollection, where("authorId", "==", params.userId));
        const querySnapshot = await getDocs(q);
        if (cancelled) return;
        const userVideos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(userVideos);
      } catch (error) {
        console.error("Error fetching user videos:", error);
      }
      if (!cancelled) setLoading(false);
    };

    fetchUserVideos();
    return () => { cancelled = true; };
  }, [params.userId]);

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This cannot be undone.')) return;
    setActionLoading(videoId);
    const result = await deleteVideo(videoId);
    if (result.success) {
      setVideos(prev => prev.filter(v => v.id !== videoId));
    }
    setActionLoading(null);
  };

  const handleToggleVisibility = async (videoId) => {
    setActionLoading(videoId);
    const result = await toggleVideoVisibility(videoId);
    if (result.success) {
      setVideos(prev =>
        prev.map(v => v.id === videoId ? { ...v, hidden: result.hidden } : v)
      );
    }
    setActionLoading(null);
  };

  // For non-owners, filter out hidden videos
  const visibleVideos = isOwner ? videos : videos.filter(v => !v.hidden);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Profile Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-8">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20">
            <span className="text-xl font-bold text-indigo-400">
              {params.userId.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-white">
                {isOwner ? 'My Profile' : 'User Profile'}
              </h1>
              {isOwner && (
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[0.6875rem] font-medium text-indigo-400">
                  You
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-500 font-mono">
              {currentUser?.email && isOwner ? currentUser.email : `${params.userId.substring(0, 12)}...`}
            </p>
          </div>
        </div>
        {isOwner && (
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Upload Video
          </Link>
        )}
      </div>

      {/* Videos Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isOwner ? 'My Videos' : 'Videos'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? 'Loading...' : `${visibleVideos.length} video${visibleVideos.length !== 1 ? 's' : ''}${isOwner && videos.some(v => v.hidden) ? ` \u00b7 ${videos.filter(v => v.hidden).length} hidden` : ''}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : visibleVideos.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleVideos.map(video => (
              <div key={video.id} className="relative">
                <VideoCard video={video} />
                {isOwner && (
                  <div className={`absolute top-3 right-3 z-10 flex gap-1.5 ${video.hidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {video.hidden && (
                      <span className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 text-[0.6875rem] font-medium text-yellow-400">
                        Hidden
                      </span>
                    )}
                  </div>
                )}
                {isOwner && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleToggleVisibility(video.id)}
                      disabled={actionLoading === video.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[0.75rem] font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                    >
                      {actionLoading === video.id ? (
                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {video.hidden ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            )}
                            {!video.hidden && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                          </svg>
                          {video.hidden ? 'Show' : 'Hide'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={actionLoading === video.id}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/10 bg-red-500/5 px-3 py-2 text-[0.75rem] font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            {/* Placeholder skeleton grid */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-40">
              {[...Array(4)].map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">No videos yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                {isOwner ? 'You haven\u2019t uploaded any videos yet.' : 'This user hasn\u2019t uploaded any videos.'}
              </p>
              <Link
                href={isOwner ? '/upload' : '/'}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
              >
                {isOwner ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Upload Your First Video
                  </>
                ) : 'Browse Videos'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
