import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import VideoCard from '../components/VideoCard';
import Link from 'next/link';

async function getVideos() {
  try {
    const videosCollection = collection(db, 'videos');
    const q = query(videosCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return videos;
  } catch (error) {
    console.error("Error fetching videos: ", error);
    // In a real app, you might want to return an error state
    return [];
  }
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Your Ultimate Video Sharing Platform
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Upload, share, and discover amazing video content from around the world.
        </p>
        <Link
          href="/upload"
          className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload a Video
        </Link>
      </div>

      {/* Video Grid */}
      <h2 className="text-3xl font-bold mb-8">Latest Videos</h2>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-400">No videos have been uploaded yet.</p>
          <p className="mt-2 text-gray-500">
            Be the first one to share a video!
          </p>
        </div>
      )}
    </div>
  );
}
