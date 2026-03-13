'use client'

import Link from 'next/link';

const CourseSidebar = ({ lessons, courseId, currentLessonId }) => {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">Lessons</h3>
      </div>
      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-2">
        {lessons.map((lesson, index) => {
          const isActive = lesson.id === currentLessonId;
          return (
            <Link
              key={lesson.id}
              href={`/course/${courseId}/lesson/${lesson.id}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                isActive
                  ? 'bg-indigo-600/10 border border-indigo-500/20'
                  : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.6875rem] font-medium ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'bg-white/[0.04] text-slate-500'
              }`}>
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[0.8125rem] font-medium truncate ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {lesson.title}
                </p>
                <div className="flex items-center gap-1.5 text-[0.6875rem] text-slate-500">
                  {lesson.type === 'video' ? (
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                    </svg>
                  ) : (
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                  {lesson.duration && <span>{lesson.duration}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSidebar;
