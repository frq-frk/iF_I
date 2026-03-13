import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

function ContestCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="aspect-[21/9] animate-pulse-soft bg-white/[0.04]" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="h-3 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-3 w-1/2 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-20 rounded-full animate-pulse-soft bg-white/[0.04]" />
          <div className="h-6 w-24 rounded-full animate-pulse-soft bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

function ContestCard({ contest, status }) {
  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    upcoming: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    past: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const statusLabels = {
    active: 'Active',
    upcoming: 'Upcoming',
    past: 'Ended',
  };

  const startDate = contest.startDate?.toDate?.() || new Date(contest.startDate);
  const endDate = contest.endDate?.toDate?.() || new Date(contest.endDate);

  return (
    <Link href={`/contest/${contest.id}`} className="block">
      <div className="animate-fade-in group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/[0.03]">
        <div className="relative aspect-[21/9] overflow-hidden">
          {contest.bannerImage ? (
            <img
              src={contest.bannerImage}
              alt={contest.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent">
              <svg className="h-12 w-12 text-indigo-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold tracking-tight text-white line-clamp-1">
            {contest.title}
          </h3>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-slate-400 line-clamp-2">
            {contest.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
            </span>
            {contest.type && (
              <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[0.6875rem] text-slate-500">
                {contest.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

async function getContests() {
  try {
    const contestsCollection = collection(db, 'contests');
    const q = query(contestsCollection, orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching contests:', error);
    return [];
  }
}

function categorizeContests(contests) {
  const now = new Date();
  const active = [];
  const upcoming = [];
  const past = [];

  for (const contest of contests) {
    const start = contest.startDate?.toDate?.() || new Date(contest.startDate);
    const end = contest.endDate?.toDate?.() || new Date(contest.endDate);

    if (now < start) {
      upcoming.push(contest);
    } else if (now > end) {
      past.push(contest);
    } else {
      active.push(contest);
    }
  }

  return { active, upcoming, past };
}

export default async function ContestsPage() {
  const contests = await getContests();
  const { active, upcoming, past } = categorizeContests(contests);
  const isEmpty = contests.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
          <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Contests</h1>
        <p className="mt-2 text-sm text-slate-500">Compete, create, and showcase your best work</p>
      </div>

      {isEmpty ? (
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ContestCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">No contests yet</h3>
            <p className="mt-1 text-sm text-slate-500">Check back soon for upcoming challenges</p>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-16">
          {/* Active Contests */}
          {active.length > 0 && (
            <section>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-xl font-bold tracking-tight text-white">Active Now</h2>
                <span className="text-sm text-slate-500">{active.length}</span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {active.map(contest => (
                  <ContestCard key={contest.id} contest={contest} status="active" />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Contests */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">Upcoming</h2>
                <span className="text-sm text-slate-500">{upcoming.length}</span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map(contest => (
                  <ContestCard key={contest.id} contest={contest} status="upcoming" />
                ))}
              </div>
            </section>
          )}

          {/* Past Contests */}
          {past.length > 0 && (
            <section>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-500" />
                <h2 className="text-xl font-bold tracking-tight text-white">Past</h2>
                <span className="text-sm text-slate-500">{past.length}</span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {past.map(contest => (
                  <ContestCard key={contest.id} contest={contest} status="past" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
