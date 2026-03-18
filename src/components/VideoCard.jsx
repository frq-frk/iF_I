'use client'

import Link from 'next/link';

const VideoCard = ({ video }) => {
  const thumbnail = video.thumbnailURL || video.thumbnail || null;

  return (
    <div className="animate-fade-in group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/[0.03]">
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/[0.03]">
              <svg className="h-10 w-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* Duration placeholder */}
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.6875rem] font-medium tabular-nums text-white">
            {video.duration || '0:00'}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-[0.9375rem] font-semibold leading-snug text-white line-clamp-1">
            {video.title}
          </h3>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-slate-400 line-clamp-2">
            {video.description}
          </p>
          {video.tags && video.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {video.tags.slice(0, 3).map(tag => (
                <span key={tag} className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[0.6875rem] text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="border-t border-white/[0.04] px-4 py-3">
        <Link
          href={`/user/${video.authorId}`}
          className="text-xs font-medium text-slate-500 transition-colors hover:text-indigo-400"
        >
          {video.authorName || video.authorId.substring(0, 8) + '...'}
        </Link>
      </div>
    </div>
  );
};

export default VideoCard;
