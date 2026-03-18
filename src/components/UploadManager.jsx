'use client'

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  startUpload,
  setProgress,
  setStage,
  completeUpload,
  failUpload,
  selectUploadActive,
} from '../store/slices/uploadSlice';
import { toast } from 'sonner';

const UploadContext = createContext(null);

export function useUploadManager() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUploadManager must be used within UploadManager');
  return ctx;
}

const STALL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function UploadManager({ children }) {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectUploadActive);
  const uploadTaskRef = useRef(null);
  const stallTimerRef = useRef(null);

  // beforeunload warning during active upload
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);

  const resetStallTimer = useCallback(() => {
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = setTimeout(() => {
      if (uploadTaskRef.current) {
        uploadTaskRef.current.cancel();
      }
      dispatch(failUpload('Upload stalled — no progress for 5 minutes'));
      toast.error('Upload timed out — no progress for 5 minutes');
    }, STALL_TIMEOUT_MS);
  }, [dispatch]);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const uploadFile = useCallback((storageRef, file) => {
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      uploadTaskRef.current = task;
      resetStallTimer();

      task.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          dispatch(setProgress(pct));
          resetStallTimer();
        },
        (error) => {
          clearStallTimer();
          if (error.code === 'storage/canceled') {
            reject(new Error('Upload cancelled'));
          } else {
            reject(error);
          }
        },
        async () => {
          clearStallTimer();
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  }, [dispatch, resetStallTimer, clearStallTimer]);

  const beginUpload = useCallback(async ({ userId, authorName, title, description, videoFile, thumbnailFile, tags, contestId }) => {
    if (active) {
      toast.error('An upload is already in progress');
      return;
    }

    dispatch(startUpload(videoFile.name));

    try {
      const timestamp = Date.now();

      // Upload video
      dispatch(setStage('video'));
      dispatch(setProgress(0));
      const videoStorageRef = ref(storage, `videos/${userId}-${timestamp}`);
      const downloadURL = await uploadFile(videoStorageRef, videoFile);

      // Upload thumbnail
      let thumbnailURL = null;
      if (thumbnailFile && thumbnailFile.size > 0) {
        dispatch(setStage('thumbnail'));
        dispatch(setProgress(0));
        const thumbStorageRef = ref(storage, `thumbnails/${userId}-${timestamp}-thumb`);
        thumbnailURL = await uploadFile(thumbStorageRef, thumbnailFile);
      }

      // Save to Firestore
      dispatch(setStage('saving'));
      dispatch(setProgress(100));
      const parsedTags = tags
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const videoDoc = await addDoc(collection(db, 'videos'), {
        title,
        description,
        downloadURL,
        thumbnailURL,
        tags: parsedTags,
        authorId: userId,
        authorName: authorName || null,
        createdAt: serverTimestamp(),
        ...(contestId ? { contestId } : {}),
      });

      if (contestId) {
        await addDoc(collection(db, 'contestSubmissions'), {
          contestId,
          videoId: videoDoc.id,
          userId,
          submittedAt: serverTimestamp(),
        });
      }

      dispatch(completeUpload());
      toast.success('Video uploaded successfully!');
    } catch (err) {
      if (err.message === 'Upload cancelled') {
        dispatch(failUpload('Upload cancelled'));
        toast.info('Upload cancelled');
      } else {
        console.error('Upload failed:', err);
        dispatch(failUpload(err.message || 'Upload failed'));
        toast.error('Failed to upload video. Please try again.');
      }
    } finally {
      uploadTaskRef.current = null;
      clearStallTimer();
    }
  }, [active, dispatch, uploadFile, clearStallTimer]);

  const cancelUpload = useCallback(() => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
    }
  }, []);

  return (
    <UploadContext.Provider value={{ beginUpload, cancelUpload }}>
      {children}
    </UploadContext.Provider>
  );
}
