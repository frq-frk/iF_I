'use client'

import Link from 'next/link';

const LessonNavigation = ({ prevLesson, nextLesson, courseId }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      {prevLesson ? (
        <Link
          href={`/course/${courseId}/lesson/${prevLesson.id}`}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <div className="text-right">
            <p className="text-[0.6875rem] text-slate-500">Previous</p>
            <p className="text-sm font-medium text-slate-300 line-clamp-1">{prevLesson.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {nextLesson ? (
        <Link
          href={`/course/${courseId}/lesson/${nextLesson.id}`}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
        >
          <div>
            <p className="text-[0.6875rem] text-slate-500">Next</p>
            <p className="text-sm font-medium text-slate-300 line-clamp-1">{nextLesson.title}</p>
          </div>
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <Link
          href={`/course/${courseId}`}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
        >
          Back to Course
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default LessonNavigation;
