'use client'

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

function VideoSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="aspect-video w-full rounded-2xl animate-pulse-soft bg-white/[0.04]" />
      <div className="mt-8 space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="h-7 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
          <div className="h-4 w-4/5 rounded-lg animate-pulse-soft bg-white/[0.04]" />
          <div className="h-4 w-1/2 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

const VideoPage = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const docRef = doc(db, "videos", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVideo({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      }
      setLoading(false);
    };

    fetchVideo();
  }, [params.id]);

  if (loading) {
    return <VideoSkeleton />;
  }

  if (!video) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">Video not found</h2>
        <p className="mt-2 text-sm text-slate-500">This video may have been removed or the link is incorrect.</p>
        <Link href="/" className="mt-6 rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-6 py-10">
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black shadow-2xl shadow-black/50">
        <video
          src={video.downloadURL}
          controls
          className="aspect-video w-full bg-black"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">{video.title}</h1>
        {video.authorId && (
          <Link
            href={`/user/${video.authorId}`}
            className="mt-2 inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-400"
          >
            {video.authorId.substring(0, 8)}...
          </Link>
        )}
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="text-sm leading-relaxed text-slate-400">{video.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
