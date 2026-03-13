'use client'

import { useAppSelector } from '../../store/hooks';
import { selectUser, selectAuthLoading } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';

const UploadPage = () => {
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const videoFile = formData.get('video');
    const thumbnailFile = formData.get('thumbnail');
    const tags = formData.get('tags');

    if (!videoFile || videoFile.size === 0) {
      setError('Please select a video file.');
      setUploading(false);
      return;
    }

    try {
      const timestamp = Date.now();

      // Upload video directly to Firebase Storage from client
      setProgress('Uploading video...');
      const videoFileName = `${user.uid}-${timestamp}`;
      const videoStorageRef = ref(storage, `videos/${videoFileName}`);
      const videoUpload = await uploadBytes(videoStorageRef, videoFile);
      const downloadURL = await getDownloadURL(videoUpload.ref);

      // Upload thumbnail if provided
      let thumbnailURL = null;
      if (thumbnailFile && thumbnailFile.size > 0) {
        setProgress('Uploading thumbnail...');
        const thumbFileName = `${user.uid}-${timestamp}-thumb`;
        const thumbStorageRef = ref(storage, `thumbnails/${thumbFileName}`);
        const thumbUpload = await uploadBytes(thumbStorageRef, thumbnailFile);
        thumbnailURL = await getDownloadURL(thumbUpload.ref);
      }

      // Parse tags
      const parsedTags = tags
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      // Save metadata to Firestore
      setProgress('Saving...');
      await addDoc(collection(db, 'videos'), {
        title,
        description,
        downloadURL,
        thumbnailURL,
        tags: parsedTags,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });

      router.push('/');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="h-6 w-40 mx-auto rounded-lg animate-pulse-soft bg-white/[0.06]" />
          <div className="h-3 w-56 mx-auto rounded-lg animate-pulse-soft bg-white/[0.04]" />
          <div className="mt-8 space-y-5">
            <div className="h-12 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            <div className="h-28 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            <div className="h-12 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            <div className="h-12 rounded-xl animate-pulse-soft bg-indigo-600/20" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Upload Video</h1>
          <p className="mt-2 text-sm text-slate-500">Share your content with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="title" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Give your video a title"
              className="mt-2 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
              required
              disabled={uploading}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what your video is about..."
              className="mt-2 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
              rows="4"
              required
              disabled={uploading}
            ></textarea>
          </div>
          <div>
            <label htmlFor="thumbnail" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Thumbnail
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-4 text-center transition-colors hover:border-white/[0.2] hover:bg-white/[0.03]">
              <svg className="mx-auto h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <input
                id="thumbnail"
                name="thumbnail"
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer file:transition-colors"
                disabled={uploading}
              />
              <p className="mt-1.5 text-xs text-slate-600">PNG, JPG, or WebP. Recommended 1280×720</p>
            </div>
          </div>
          <div>
            <label htmlFor="video" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Video File
            </label>
            <div className="mt-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-6 text-center transition-colors hover:border-white/[0.2] hover:bg-white/[0.03]">
              <svg className="mx-auto h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                className="mt-3 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer file:transition-colors"
                required
                disabled={uploading}
              />
              <p className="mt-2 text-xs text-slate-600">MP4, WebM, or OGG up to 500MB</p>
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Tags <span className="normal-case tracking-normal text-slate-600">(optional)</span>
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="e.g. music, tutorial, vlog"
              className="mt-2 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
              disabled={uploading}
            />
            <p className="mt-1.5 text-xs text-slate-600">Separate tags with commas</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {progress || 'Uploading...'}
              </>
            ) : (
              'Upload Video'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
