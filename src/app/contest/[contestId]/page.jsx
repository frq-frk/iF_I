'use client'

import { use, useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import VideoCard from '../../../components/VideoCard';
import Link from 'next/link';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
      <div className="aspect-[21/9] w-full rounded-2xl animate-pulse-soft bg-white/[0.04]" />
      <div className="mt-8 space-y-4">
        <div className="h-8 w-1/2 rounded-xl animate-pulse-soft bg-white/[0.06]" />
        <div className="h-4 w-3/4 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-4 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="aspect-video animate-pulse-soft bg-white/[0.04]" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 rounded-lg animate-pulse-soft bg-white/[0.06]" />
              <div className="h-3 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContestDetailPage({ params }) {
  const { contestId } = use(params);
  const user = useAppSelector(selectUser);

  const [contest, setContest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch contest
        const contestSnap = await getDoc(doc(db, 'contests', contestId));
        if (!contestSnap.exists()) {
          setContest(null);
          setLoading(false);
          return;
        }
        setContest({ id: contestSnap.id, ...contestSnap.data() });

        // Fetch submissions for this contest
        const subsQuery = query(
          collection(db, 'contestSubmissions'),
          where('contestId', '==', contestId),
          orderBy('submittedAt', 'desc')
        );
        const subsSnap = await getDocs(subsQuery);
        const subsDocs = subsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch the actual video docs for each submission
        const videoIds = subsDocs.map(s => s.videoId);
        if (videoIds.length > 0) {
          const videoPromises = videoIds.map(vid =>
            getDoc(doc(db, 'videos', vid))
          );
          const videoSnaps = await Promise.all(videoPromises);
          const videos = videoSnaps
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() }));
          setSubmissions(videos);
        }
      } catch (error) {
        console.error('Error fetching contest:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [contestId]);

  if (loading) return <DetailSkeleton />;

  if (!contest) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Contest not found</h2>
          <p className="mt-1 text-sm text-slate-500">This contest may have been removed</p>
          <Link href="/contests" className="mt-6 inline-block rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white">
            Back to Contests
          </Link>
        </div>
      </div>
    );
  }

  const startDate = contest.startDate?.toDate?.() || new Date(contest.startDate);
  const endDate = contest.endDate?.toDate?.() || new Date(contest.endDate);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isPast = now > endDate;

  const status = isActive ? 'active' : isUpcoming ? 'upcoming' : 'past';
  const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    upcoming: { label: 'Upcoming', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    past: { label: 'Ended', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="aspect-[21/9]">
          {contest.bannerImage ? (
            <img
              src={contest.bannerImage}
              alt={contest.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent">
              <svg className="h-16 w-16 text-indigo-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium ${statusConfig[status].color}`}>
            {statusConfig[status].label}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {contest.title}
          </h1>
        </div>
      </div>

      {/* Contest Info */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">About</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-300">
            {contest.description}
          </p>

          {contest.referenceScene && (
            <div className="mt-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">Reference Scene</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-300">
                {contest.referenceScene}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Dates */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Timeline</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.6875rem] text-slate-500">Starts</p>
                  <p className="text-sm font-medium text-white">{startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                  <svg className="h-3.5 w-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.6875rem] text-slate-500">Deadline</p>
                  <p className="text-sm font-medium text-white">{endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Submissions</h3>
            <p className="mt-2 text-2xl font-bold text-white">{submissions.length}</p>
          </div>

          {contest.type && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Category</h3>
              <p className="mt-2 text-sm font-medium text-white">{contest.type}</p>
            </div>
          )}

          {/* Submit CTA */}
          {isActive && user && (
            <Link
              href={`/upload?contestId=${contest.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Submit Entry
            </Link>
          )}
          {isActive && !user && (
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
            >
              Log in to submit
            </Link>
          )}
          {isUpcoming && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-400">
              Submissions open {startDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Submissions Grid */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Submissions</h2>
            <p className="mt-1 text-sm text-slate-500">
              {submissions.length > 0
                ? `${submissions.length} ${submissions.length === 1 ? 'entry' : 'entries'} submitted`
                : 'No entries yet — be the first!'}
            </p>
          </div>
        </div>

        {submissions.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {submissions.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-16">
            <svg className="h-10 w-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="mt-3 text-sm text-slate-500">No submissions yet</p>
            {isActive && user && (
              <Link
                href={`/upload?contestId=${contest.id}`}
                className="mt-4 rounded-lg bg-indigo-600/20 px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-600/30"
              >
                Be the first to submit
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
