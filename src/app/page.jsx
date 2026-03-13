import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import VideoCard from '../components/VideoCard';
import Link from 'next/link';

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

async function getVideos() {
  try {
    const videosCollection = collection(db, 'videos');
    const q = query(videosCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return videos.filter(v => !v.hidden);
  } catch (error) {
    console.error("Error fetching videos: ", error);
    return [];
  }
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/[0.07] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Share videos with
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"> the world</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Upload, discover, and enjoy video content from creators everywhere. Simple, fast, and beautiful.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/upload"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
            >
              Upload a Video
            </Link>
            <Link
              href="#latest"
              className="rounded-xl bg-white/[0.06] px-6 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
            >
              Browse Videos
            </Link>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section id="latest" className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Latest Videos</h2>
            <p className="mt-1 text-sm text-slate-500">Recently uploaded by the community</p>
          </div>
        </div>

        {videos.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {/* Placeholder skeleton grid showing what layout looks like with content */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">No videos yet</h3>
              <p className="mt-2 text-sm text-slate-500">Be the first to share something amazing.</p>
              <Link
                href="/upload"
                className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
              >
                Upload a Video
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
