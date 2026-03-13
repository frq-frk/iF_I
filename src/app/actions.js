'use server'

import { auth, db, storage } from '../lib/firebase';
import { ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc, updateDoc, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";

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

export async function followUser(targetUserId) {
  const user = auth.currentUser;
  if (!user) return { error: 'You must be logged in.' };
  if (user.uid === targetUserId) return { error: 'You cannot follow yourself.' };

  try {
    const myRef = doc(db, 'users', user.uid);
    const targetRef = doc(db, 'users', targetUserId);

    await Promise.all([
      updateDoc(myRef, { following: arrayUnion(targetUserId) }),
      updateDoc(targetRef, { followers: arrayUnion(user.uid) }),
    ]);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to follow user.' };
  }
}

export async function unfollowUser(targetUserId) {
  const user = auth.currentUser;
  if (!user) return { error: 'You must be logged in.' };

  try {
    const myRef = doc(db, 'users', user.uid);
    const targetRef = doc(db, 'users', targetUserId);

    await Promise.all([
      updateDoc(myRef, { following: arrayRemove(targetUserId) }),
      updateDoc(targetRef, { followers: arrayRemove(user.uid) }),
    ]);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to unfollow user.' };
  }
}
