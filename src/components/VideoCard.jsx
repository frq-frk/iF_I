import Link from 'next/link';

const VideoCard = ({ video }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative">
          <img
            src={video.thumbnail || 'https://placehold.co/600x400'} // Placeholder for thumbnail
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-25"></div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold truncate">{video.title}</h3>
          <p className="text-gray-400 text-sm mt-1 h-10 overflow-hidden">{video.description}</p>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <Link href={`/user/${video.authorId}`} className="text-sm text-blue-400 hover:underline">
          By: {video.authorId.substring(0, 8)}...
        </Link>
      </div>
    </div>
  );
};

export default VideoCard;
