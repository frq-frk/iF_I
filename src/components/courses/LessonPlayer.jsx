'use client'

const LessonPlayer = ({ lesson }) => {
  if (lesson.type === 'video') {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
        <div className="aspect-video">
          <video
            src={lesson.contentURL}
            controls
            className="h-full w-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // Article lesson
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        Article
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
        {lesson.contentURL}
      </div>
    </div>
  );
};

export default LessonPlayer;
