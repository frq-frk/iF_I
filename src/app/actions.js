'use server'

import { auth, db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";

export async function uploadVideo(prevState, formData) {
  const title = formData.get('title');
  const description = formData.get('description');
  const videoFile = formData.get('video');
  const user = auth.currentUser;

  if (!user) {
    return { message: 'You must be logged in to upload a video.' };
  }

  try {
    const fileName = `${user.uid}-${Date.now()}`;
    const storageRef = ref(storage, `videos/${fileName}`);
    const uploadTask = await uploadBytes(storageRef, videoFile);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    await addDoc(collection(db, "videos"), {
      title,
      description,
      downloadURL,
      authorId: user.uid,
      createdAt: serverTimestamp()
    });

    return { message: 'Video uploaded successfully!' };
  } catch (error) {
    return { message: 'Failed to upload video.' };
  }
}

export async function deleteVideo(videoId) {
  const user = auth.currentUser;
  if (!user) {
    return { error: 'You must be logged in.' };
  }

  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      return { error: 'Video not found.' };
    }

    if (videoSnap.data().authorId !== user.uid) {
      return { error: 'You can only delete your own videos.' };
    }

    // Delete from Storage
    try {
      const videoUrl = videoSnap.data().downloadURL;
      const storageRef = ref(storage, videoUrl);
      await deleteObject(storageRef);
    } catch {
      // Storage file may already be deleted — continue with Firestore cleanup
    }

    await deleteDoc(videoRef);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete video.' };
  }
}

export async function toggleVideoVisibility(videoId) {
  const user = auth.currentUser;
  if (!user) {
    return { error: 'You must be logged in.' };
  }

  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      return { error: 'Video not found.' };
    }

    if (videoSnap.data().authorId !== user.uid) {
      return { error: 'You can only modify your own videos.' };
    }

    const currentlyHidden = videoSnap.data().hidden || false;
    await updateDoc(videoRef, { hidden: !currentlyHidden });
    return { success: true, hidden: !currentlyHidden };
  } catch (error) {
    return { error: 'Failed to update video visibility.' };
  }
}
