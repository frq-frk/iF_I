'use client'

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useEffect, useState } from 'react';

const VideoPage = ({ params }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const docRef = doc(db, "videos", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVideo({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      }
      setLoading(false);
    };

    fetchVideo();
  }, [params.id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!video) {
    return <p>Video not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-2xl">
          <video src={video.downloadURL} controls className="w-full h-full object-contain"></video>
        </div>
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-inner">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">{video.title}</h1>
            <p className="mt-4 text-lg text-gray-300">{video.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
