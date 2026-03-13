import Link from 'next/link';

const VideoCard = ({ video }) => {
  return (
    <div className="animate-fade-in group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-indigo-500/[0.03]">
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail || 'https://placehold.co/640x360/111118/333346?text=%E2%96%B6'}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
        </div>
      </Link>
      <div className="border-t border-white/[0.04] px-4 py-3">
        <Link
          href={`/user/${video.authorId}`}
          className="text-xs font-medium text-slate-500 transition-colors hover:text-indigo-400"
        >
          {video.authorId.substring(0, 8)}...
        </Link>
      </div>
    </div>
  );
};

export default VideoCard;
