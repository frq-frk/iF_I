'use client'

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useEffect, useState } from 'react';
import VideoCard from '../../../components/VideoCard';

const UserProfilePage = ({ params }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const videosCollection = collection(db, 'videos');
        const q = query(videosCollection, where("authorId", "==", params.userId));
        const querySnapshot = await getDocs(q);
        const userVideos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(userVideos);

        if (userVideos.length > 0) {
          // In a real app, you would fetch user data from a 'users' collection
          // For now, we'll just show the user ID as we don't have user emails stored with videos
          setUserEmail(params.userId);
        }

      } catch (error) {
        console.error("Error fetching user videos:", error);
      }
      setLoading(false);
    };

    fetchUserVideos();
  }, [params.userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">
          User Profile
        </h1>
        <p className="mt-2 text-xl text-gray-400">Videos by {userEmail}</p>
      </div>

      {loading ? (
        <p>Loading videos...</p>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-400">This user hasn't uploaded any videos yet.</p>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
