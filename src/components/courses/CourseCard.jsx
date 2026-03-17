'use client'

import Link from 'next/link';

const levelColors = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CourseCard = ({ course }) => {
  const thumbnail = course.thumbnail || null;

  return (
    <div className="animate-fade-in group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/[0.03]">
      <Link href={`/course/${course.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent">
              <svg className="h-10 w-10 text-indigo-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {course.duration && (
            <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.6875rem] font-medium tabular-nums text-white">
              {course.duration}
            </div>
          )}
          <div className="absolute bottom-2 left-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-medium capitalize ${levelColors[course.level] || levelColors.beginner}`}>
              {course.level}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-[0.9375rem] font-semibold leading-snug text-white line-clamp-1">
            {course.title}
          </h3>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-slate-400 line-clamp-2">
            {course.description}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 5.256c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125" />
              </svg>
              {course.lessonsCount || 0} lessons
            </span>
          </div>
          {course.tags && course.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[0.6875rem] text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
