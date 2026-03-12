'use client'

import { useAppSelector } from '../../store/hooks';
import { selectUser, selectAuthLoading } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useActionState } from 'react';
import { uploadVideo } from '../actions';

const initialState = {
  message: null,
};

const UploadPage = () => {
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const router = useRouter();
  const [state, formAction] = useActionState(uploadVideo, initialState);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (state.message === 'Video uploaded successfully!') {
      router.push('/');
    }
  }, [state.message, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Upload Video</h1>
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full px-4 py-2 mt-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              className="w-full px-4 py-2 mt-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="video" className="block text-sm font-medium">Video File</label>
            <input
              id="video"
              name="video"
              type="file"
              accept="video/*"
              className="w-full px-4 py-2 mt-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload
          </button>
          {state.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
